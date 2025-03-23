"""
Integration tests for the application.
These tests simulate a frontend client interacting with the backend API.
"""

import os
import sys
import json
import pytest
import requests
from decimal import Decimal
from datetime import datetime
import threading
import time
import subprocess
from urllib.parse import urljoin

# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from models import db, Client, Supplier, MaterialsInvoice, Transaction, Debt, InvoiceStatus

# Constants for integration tests
API_URL = "http://localhost:5000"
FRONTEND_URL = "http://localhost:3000"
GRAPHQL_ENDPOINT = "/graphql"

class TestServer:
    """Server runner for integration tests."""
    
    def __init__(self, app, port=5000):
        self.app = app
        self.port = port
        self.server_thread = None
        self.is_running = False
    
    def start(self):
        """Start the test server in a thread."""
        if self.is_running:
            return
        
        from flask import Flask
        
        def run_server():
            self.app.run(port=self.port, debug=False, use_reloader=False)
        
        self.server_thread = threading.Thread(target=run_server)
        self.server_thread.daemon = True
        self.server_thread.start()
        self.is_running = True
        
        # Wait for server to start
        time.sleep(1)
    
    def stop(self):
        """Stop the test server."""
        if not self.is_running:
            return
        
        # Stop the server (if possible)
        self.is_running = False
        self.server_thread = None

@pytest.fixture(scope="module")
def integration_app():
    """Create a test Flask application with in-memory SQLite database."""
    app = create_app(testing=True)
    
    # Initialize the database with test data
    with app.app_context():
        db.create_all()
        
        # Add sample client
        client = Client(name="Integration Test Client", markup_rate=Decimal("0.15"))
        db.session.add(client)
        
        # Add sample supplier
        supplier = Supplier(name="Integration Test Supplier")
        db.session.add(supplier)
        
        db.session.commit()
    
    yield app
    
    # Clean up
    with app.app_context():
        db.session.remove()
        db.drop_all()

@pytest.fixture(scope="module")
def test_server(integration_app):
    """Start the test server for integration tests."""
    server = TestServer(integration_app)
    server.start()
    yield server
    server.stop()

@pytest.mark.integration
def test_basic_graphql_api(test_server):
    """Test basic GraphQL API functionality."""
    # Query clients
    query = """
    {
      clients(first: 5) {
        edges {
          node {
            id
            name
            markup_rate
          }
        }
      }
    }
    """
    
    response = requests.post(
        urljoin(API_URL, GRAPHQL_ENDPOINT),
        json={"query": query}
    )
    
    assert response.status_code == 200
    data = response.json()
    
    assert "data" in data
    assert "clients" in data["data"]
    assert "edges" in data["data"]["clients"]
    assert len(data["data"]["clients"]["edges"]) > 0
    
    # Create a new invoice using the API
    mutation = """
    mutation CreateInvoice($clientId: ID!, $supplierId: ID!, $invoiceDate: String!, $baseAmount: Float!) {
      createMaterialsInvoice(
        clientId: $clientId
        supplierId: $supplierId
        invoiceDate: $invoiceDate
        baseAmount: $baseAmount
      ) {
        invoice {
          id
          baseAmount
          status
        }
        errors
      }
    }
    """
    
    # Get client and supplier IDs
    client_id = data["data"]["clients"]["edges"][0]["node"]["id"]
    
    # Query suppliers
    query = """
    {
      suppliers(first: 10) {
        edges {
          node {
            id
            name
          }
        }
      }
    }
    """
    
    response = requests.post(
        urljoin(API_URL, GRAPHQL_ENDPOINT),
        json={"query": query}
    )
    
    assert response.status_code == 200
    data = response.json()
    supplier_id = data["data"]["suppliers"]["edges"][0]["node"]["id"]
    
    # Create invoice
    variables = {
        "clientId": client_id,
        "supplierId": supplier_id,
        "invoiceDate": "2023-04-20",
        "baseAmount": 888.88
    }
    
    response = requests.post(
        urljoin(API_URL, GRAPHQL_ENDPOINT),
        json={"query": mutation, "variables": variables}
    )
    
    assert response.status_code == 200
    data = response.json()
    
    assert "data" in data
    assert "createMaterialsInvoice" in data["data"]
    assert "invoice" in data["data"]["createMaterialsInvoice"]
    assert "errors" in data["data"]["createMaterialsInvoice"]
    
    # Should not have errors
    assert data["data"]["createMaterialsInvoice"]["errors"] is None
    
    # Invoice should have been created
    invoice = data["data"]["createMaterialsInvoice"]["invoice"]
    assert invoice["baseAmount"] == "888.88"
    assert invoice["status"] == "UNPAID"
    
    # Verify that a debt was created automatically
    query = """
    {
      debts(first: 10) {
        edges {
          node {
            amount
            materialsInvoice {
              baseAmount
            }
          }
        }
      }
    }
    """
    
    response = requests.post(
        urljoin(API_URL, GRAPHQL_ENDPOINT),
        json={"query": query}
    )
    
    assert response.status_code == 200
    data = response.json()
    
    # Find the debt for our new invoice
    found_debt = False
    for edge in data["data"]["debts"]["edges"]:
        if edge["node"]["materialsInvoice"]["baseAmount"] == "888.88":
            found_debt = True
            break
    
    assert found_debt, "Debt was not created automatically"

@pytest.mark.integration
def test_error_handling(test_server):
    """Test API error handling."""
    # Send an invalid query
    invalid_query = """
    {
      invalidField {
        something
      }
    }
    """
    
    response = requests.post(
        urljoin(API_URL, GRAPHQL_ENDPOINT),
        json={"query": invalid_query}
    )
    
    assert response.status_code == 200  # GraphQL returns 200 even for errors
    data = response.json()
    
    assert "errors" in data
    assert len(data["errors"]) > 0
    
    # Send a mutation with validation errors
    mutation = """
    mutation CreateInvoice($clientId: ID!, $supplierId: ID!, $invoiceDate: String!, $baseAmount: Float!) {
      createMaterialsInvoice(
        clientId: $clientId
        supplierId: $supplierId
        invoiceDate: $invoiceDate
        baseAmount: $baseAmount
      ) {
        invoice {
          id
        }
        errors
      }
    }
    """
    
    # Use an invalid client ID
    variables = {
        "clientId": "invalid-id",
        "supplierId": "invalid-id",
        "invoiceDate": "2023-04-20",
        "baseAmount": 100.00
    }
    
    response = requests.post(
        urljoin(API_URL, GRAPHQL_ENDPOINT),
        json={"query": mutation, "variables": variables}
    )
    
    assert response.status_code == 200
    data = response.json()
    
    assert "data" in data
    assert "createMaterialsInvoice" in data["data"]
    assert "errors" in data["data"]["createMaterialsInvoice"]
    
    # Should have errors and no invoice
    assert data["data"]["createMaterialsInvoice"]["errors"] is not None
    assert len(data["data"]["createMaterialsInvoice"]["errors"]) > 0
    assert data["data"]["createMaterialsInvoice"]["invoice"] is None

@pytest.mark.integration
def test_complex_query(test_server):
    """Test a complex nested GraphQL query."""
    # Create some data first
    # Query for a client ID
    query = """
    {
      clients(first: 1) {
        edges {
          node {
            id
            name
          }
        }
      }
    }
    """
    
    response = requests.post(
        urljoin(API_URL, GRAPHQL_ENDPOINT),
        json={"query": query}
    )
    
    assert response.status_code == 200
    data = response.json()
    client_id = data["data"]["clients"]["edges"][0]["node"]["id"]
    
    # Query for a supplier ID
    query = """
    {
      suppliers(first: 1) {
        edges {
          node {
            id
            name
          }
        }
      }
    }
    """
    
    response = requests.post(
        urljoin(API_URL, GRAPHQL_ENDPOINT),
        json={"query": query}
    )
    
    assert response.status_code == 200
    data = response.json()
    supplier_id = data["data"]["suppliers"]["edges"][0]["node"]["id"]
    
    # Create an invoice
    mutation = """
    mutation CreateInvoice($clientId: ID!, $supplierId: ID!, $invoiceDate: String!, $baseAmount: Float!) {
      createMaterialsInvoice(
        clientId: $clientId
        supplierId: $supplierId
        invoiceDate: $invoiceDate
        baseAmount: $baseAmount
      ) {
        invoice {
          id
        }
        errors
      }
    }
    """
    
    variables = {
        "clientId": client_id,
        "supplierId": supplier_id,
        "invoiceDate": "2023-05-15",
        "baseAmount": 999.99
    }
    
    response = requests.post(
        urljoin(API_URL, GRAPHQL_ENDPOINT),
        json={"query": mutation, "variables": variables}
    )
    
    assert response.status_code == 200
    
    # Now run a complex query that gets all invoices with their clients, suppliers, debts, and transactions
    complex_query = """
    {
      clients(first: 10) {
        edges {
          node {
            id
            name
            markup_rate
            debts {
              edges {
                node {
                  id
                  amount
                  description
                }
              }
            }
            materialsInvoices {
              edges {
                node {
                  id
                  invoiceDate
                  baseAmount
                  status
                  supplier {
                    id
                    name
                  }
                }
              }
            }
          }
        }
      }
    }
    """
    
    response = requests.post(
        urljoin(API_URL, GRAPHQL_ENDPOINT),
        json={"query": complex_query}
    )
    
    assert response.status_code == 200
    data = response.json()
    
    assert "data" in data
    assert "clients" in data["data"]
    assert "edges" in data["data"]["clients"]
    assert len(data["data"]["clients"]["edges"]) > 0
    
    # Verify the structure of the nested data
    client = data["data"]["clients"]["edges"][0]["node"]
    assert "id" in client
    assert "name" in client
    assert "markup_rate" in client
    assert "debts" in client
    assert "edges" in client["debts"]
    assert "materialsInvoices" in client
    assert "edges" in client["materialsInvoices"]
    
    # Check that our invoice is present
    found_invoice = False
    for client_edge in data["data"]["clients"]["edges"]:
        client_node = client_edge["node"]
        if "materialsInvoices" in client_node and client_node["materialsInvoices"]["edges"]:
            for invoice_edge in client_node["materialsInvoices"]["edges"]:
                invoice_node = invoice_edge["node"]
                if "baseAmount" in invoice_node and invoice_node["baseAmount"] == "999.99":
                    found_invoice = True
                    break
    
    assert found_invoice, "The created invoice was not found in the query results" 