"""
Tests for the GraphQL schema and resolvers.
These tests ensure that the GraphQL API works correctly.
"""

import os
import sys
import json
import pytest
from decimal import Decimal
from datetime import datetime, date

# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from models import db, Client, Supplier, MaterialsInvoice, Transaction, Debt, InvoiceStatus
from utils import to_global_id

@pytest.fixture
def app():
    """Create a test Flask application with in-memory SQLite database."""
    app = create_app(testing=True)
    
    # Create all tables
    with app.app_context():
        db.create_all()
    
    yield app
    
    # Clean up
    with app.app_context():
        db.session.remove()
        db.drop_all()

@pytest.fixture
def populated_db_with_invoices(app_context, populated_db):
    """Create a database with test data including invoices and transactions."""
    client = Client.query.first()
    supplier = Supplier.query.first()
    
    # Add a materials invoice
    invoice = MaterialsInvoice(
        client_id=client.id,
        supplier_id=supplier.id,
        invoice_date=date(2023, 4, 15),
        base_amount=Decimal('500.00'),
        status=InvoiceStatus.UNPAID
    )
    db.session.add(invoice)
    db.session.flush()  # Flush to get the invoice ID without committing the transaction
    
    # Add a debt
    debt = Debt(
        party="Client",
        amount=Decimal('575.00'),  # 500 + 15% markup
        invoice_id=invoice.id
    )
    db.session.add(debt)
    
    # Add a transaction
    transaction = Transaction(
        invoice_id=invoice.id,
        amount=Decimal('200.00')
    )
    db.session.add(transaction)
    
    db.session.commit()
    return db

def execute_graphql_query(client, query, variables=None):
    """Helper function to execute a GraphQL query."""
    return client.post(
        '/graphql',
        json={'query': query, 'variables': variables or {}}
    )

def test_query_clients(client, populated_db):
    """Test querying clients through GraphQL."""
    query = """
    {
      clients(first: 10) {
        edges {
          node {
            id
            name
            markup_rate
          }
          cursor
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
    """
    
    response = execute_graphql_query(client, query)
    assert response.status_code == 200
    
    data = json.loads(response.data)
    assert 'data' in data
    assert 'clients' in data['data']
    assert 'edges' in data['data']['clients']
    
    # Should have at least one client
    assert len(data['data']['clients']['edges']) > 0
    
    # First client should have expected fields
    client_node = data['data']['clients']['edges'][0]['node']
    assert 'id' in client_node
    assert 'name' in client_node
    assert 'markup_rate' in client_node
    assert client_node['name'] == 'Test Client'

def test_query_suppliers(client, populated_db):
    """Test querying suppliers through GraphQL."""
    query = """
    {
      suppliers(first: 10) {
        edges {
          node {
            id
            name
          }
          cursor
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
    """
    
    response = execute_graphql_query(client, query)
    assert response.status_code == 200
    
    data = json.loads(response.data)
    assert 'data' in data
    assert 'suppliers' in data['data']
    
    # Should have at least one supplier
    assert len(data['data']['suppliers']['edges']) > 0
    
    # First supplier should have expected fields
    supplier_node = data['data']['suppliers']['edges'][0]['node']
    assert 'id' in supplier_node
    assert 'name' in supplier_node
    assert supplier_node['name'] == 'Test Supplier'

def test_query_invoices(client, populated_db_with_invoices):
    """Test querying invoices through GraphQL."""
    query = """
    {
      invoices(first: 10) {
        edges {
          node {
            id
            invoice_date
            base_amount
            status
            client {
              id
              name
            }
            supplier {
              id
              name
            }
          }
          cursor
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
    """
    
    response = execute_graphql_query(client, query)
    assert response.status_code == 200
    
    data = json.loads(response.data)
    assert 'data' in data
    assert 'invoices' in data['data']
    
    # Should have at least one invoice
    assert len(data['data']['invoices']['edges']) > 0
    
    # First invoice should have expected fields
    invoice_node = data['data']['invoices']['edges'][0]['node']
    assert 'id' in invoice_node
    assert 'invoice_date' in invoice_node
    assert 'base_amount' in invoice_node
    assert 'status' in invoice_node
    assert 'client' in invoice_node
    assert 'supplier' in invoice_node
    assert float(invoice_node['base_amount']) == 500.00
    assert invoice_node['client']['name'] == 'Test Client'
    assert invoice_node['supplier']['name'] == 'Test Supplier'

def test_query_debts(client, populated_db_with_invoices):
    """Test querying debts through GraphQL."""
    query = """
    {
      debts(first: 10) {
        edges {
          node {
            id
            amount
            party
            invoice {
              id
              base_amount
            }
          }
          cursor
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
    """
    
    response = execute_graphql_query(client, query)
    assert response.status_code == 200
    
    data = json.loads(response.data)
    assert 'data' in data
    assert 'debts' in data['data']
    
    # Should have at least one debt
    assert len(data['data']['debts']['edges']) > 0
    
    # First debt should have expected fields
    debt_node = data['data']['debts']['edges'][0]['node']
    assert 'id' in debt_node
    assert 'amount' in debt_node
    assert 'party' in debt_node
    assert 'invoice' in debt_node
    assert float(debt_node['amount']) == 575.00
    assert debt_node['party'] == 'Client'
    assert float(debt_node['invoice']['base_amount']) == 500.00

def test_query_transactions(client, populated_db_with_invoices):
    """Test querying transactions through GraphQL."""
    query = """
    {
      transactions(first: 10) {
        edges {
          node {
            id
            amount
            invoice {
              id
              base_amount
            }
          }
          cursor
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
    """
    
    response = execute_graphql_query(client, query)
    assert response.status_code == 200
    
    data = json.loads(response.data)
    assert 'data' in data
    assert 'transactions' in data['data']
    
    # Should have at least one transaction
    assert len(data['data']['transactions']['edges']) > 0
    
    # First transaction should have expected fields
    transaction_node = data['data']['transactions']['edges'][0]['node']
    assert 'id' in transaction_node
    assert 'amount' in transaction_node
    assert 'invoice' in transaction_node
    assert float(transaction_node['amount']) == 200.00
    assert float(transaction_node['invoice']['base_amount']) == 500.00

def test_create_materials_invoice_mutation(client, app, app_context):
    """Test creating a materials invoice through GraphQL mutation."""
    # Start fresh - make sure there are no active transactions
    db.session.remove()
    
    # Set up test data in a clean session
    client_obj = Client(name="Test Client", markup_rate=Decimal("0.15"))
    db.session.add(client_obj)
    
    supplier_obj = Supplier(name="Test Supplier")
    db.session.add(supplier_obj)
    
    # Commit to the database
    db.session.commit()
    
    # Get their IDs
    client_id = client_obj.id
    supplier_id = supplier_obj.id
    
    # Close the session to ensure no lingering transaction
    db.session.remove()
    
    # Build the mutation
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
          invoice_date
          base_amount
          status
          client {
            name
          }
          supplier {
            name
          }
        }
        errors
      }
    }
    """
    
    variables = {
        "clientId": to_global_id("Client", client_id),
        "supplierId": to_global_id("Supplier", supplier_id),
        "invoiceDate": "2023-04-20",
        "baseAmount": 750.50
    }
    
    # Execute the mutation
    response = client.post(
        '/graphql',
        json={'query': mutation, 'variables': variables}
    )
    
    assert response.status_code == 200
    
    data = json.loads(response.data)
    assert 'data' in data
    assert 'createMaterialsInvoice' in data['data']
    assert 'invoice' in data['data']['createMaterialsInvoice']
    assert 'errors' in data['data']['createMaterialsInvoice']
    
    # Should not have errors
    assert data['data']['createMaterialsInvoice']['errors'] is None
    
    # Verify invoice data
    invoice = data['data']['createMaterialsInvoice']['invoice']
    assert invoice['invoice_date'] == '2023-04-20'
    assert float(invoice['base_amount']) == 750.50
    assert invoice['status'] == 'UNPAID'
    assert invoice['client']['name'] == 'Test Client'
    assert invoice['supplier']['name'] == 'Test Supplier'

def test_create_materials_invoice_mutation_validation_errors(client, app, app_context):
    """Test validation errors in the materials invoice creation mutation."""
    # Start fresh - make sure there are no active transactions
    db.session.remove()
    
    # Set up test data in a clean session
    validation_client = Client(name="Validation Client", markup_rate=Decimal("0.15"))
    db.session.add(validation_client)
    
    validation_supplier = Supplier(name="Validation Supplier")
    db.session.add(validation_supplier)
    
    # Commit to the database
    db.session.commit()
    
    # Get IDs
    client_id = validation_client.id
    supplier_id = validation_supplier.id
    
    # Close the session to ensure no lingering transaction
    db.session.remove()
    
    # Define the mutation
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
    
    # Test case 1: Negative base amount
    variables = {
        "clientId": to_global_id("Client", client_id),
        "supplierId": to_global_id("Supplier", supplier_id),
        "invoiceDate": "2023-04-20",
        "baseAmount": -50.0  # Negative amount should trigger validation error
    }
    
    response = client.post(
        '/graphql',
        json={'query': mutation, 'variables': variables}
    )
    
    assert response.status_code == 200
    
    data = json.loads(response.data)
    assert 'data' in data
    assert 'createMaterialsInvoice' in data['data']
    assert 'invoice' in data['data']['createMaterialsInvoice']
    assert data['data']['createMaterialsInvoice']['invoice'] is None
    assert 'errors' in data['data']['createMaterialsInvoice']
    assert len(data['data']['createMaterialsInvoice']['errors']) > 0
    assert "Base amount must be a positive number" in data['data']['createMaterialsInvoice']['errors'][0]
    
    # Test case 2: Invalid client ID
    variables = {
        "clientId": to_global_id("Client", 9999),  # Non-existent client ID
        "supplierId": to_global_id("Supplier", supplier_id),
        "invoiceDate": "2023-04-20",
        "baseAmount": 100.0
    }
    
    response = client.post(
        '/graphql',
        json={'query': mutation, 'variables': variables}
    )
    
    assert response.status_code == 200
    
    data = json.loads(response.data)
    assert 'data' in data
    assert 'createMaterialsInvoice' in data['data']
    assert 'invoice' in data['data']['createMaterialsInvoice']
    assert data['data']['createMaterialsInvoice']['invoice'] is None
    assert 'errors' in data['data']['createMaterialsInvoice']
    assert len(data['data']['createMaterialsInvoice']['errors']) > 0
    assert "Client not found" in data['data']['createMaterialsInvoice']['errors'][0] 