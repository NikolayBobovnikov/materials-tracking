"""
Test configuration for the backend application.
This file contains fixtures and configuration for pytest.
"""

import os
import sys
import pytest
from decimal import Decimal
from flask import Flask

# Add the parent directory to sys.path to allow imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import modules directly
from models import db, Client, Supplier, MaterialsInvoice, Transaction, Debt, InvoiceStatus

@pytest.fixture
def app():
    """Create a test Flask application with in-memory SQLite database."""
    app = Flask(__name__)
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Initialize the app with this database
    db.init_app(app)
    
    # Create the database and tables
    with app.app_context():
        db.create_all()
    
    yield app
    
    # Clean up
    with app.app_context():
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    """Create a test client for the app."""
    return app.test_client()

@pytest.fixture
def app_context(app):
    """Create an application context for the test."""
    with app.app_context():
        yield

@pytest.fixture
def populated_db(app):
    """Create a database with test data."""
    with app.app_context():
        # Add sample client
        client = Client(name="Test Client", markup_rate=Decimal("0.15"))
        db.session.add(client)
        
        # Add sample supplier
        supplier = Supplier(name="Test Supplier")
        db.session.add(supplier)
        
        db.session.commit()
        
        yield db 