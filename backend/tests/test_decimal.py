import pytest
from decimal import Decimal
from flask import Flask
import os
import sys

# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models import db, Client, Supplier, MaterialsInvoice, Transaction, Debt, InvoiceStatus

@pytest.fixture
def app():
    """Create a Flask application configured for testing."""
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Initialize the app with the database
    db.init_app(app)
    
    # Create all tables
    with app.app_context():
        db.create_all()
        
    return app

@pytest.fixture
def test_client(app):
    """Create a test client for the app."""
    return app.test_client()

@pytest.fixture
def init_database(app):
    """Initialize the database with test data."""
    with app.app_context():
        # Create sample client and supplier
        client = Client(name="Test Client", markup_rate=Decimal('0.15'))
        supplier = Supplier(name="Test Supplier")
        
        db.session.add_all([client, supplier])
        db.session.commit()
        
        # Store the IDs for later retrieval
        client_id = client.id
        supplier_id = supplier.id
        
    # Return the IDs instead of the objects
    return {
        'client_id': client_id,
        'supplier_id': supplier_id
    }

def test_decimal_types(app, init_database):
    """Test that Decimal types are properly used in the database."""
    with app.app_context():
        # Get fresh instances of client and supplier from the database
        client_id = init_database['client_id']
        supplier_id = init_database['supplier_id']
        
        client = db.session.query(Client).filter_by(id=client_id).first()
        supplier = db.session.query(Supplier).filter_by(id=supplier_id).first()
        
        # Verify client markup_rate is a Decimal
        assert isinstance(client.markup_rate, Decimal)
        assert client.markup_rate == Decimal('0.15')
        
        # Create an invoice with a specific decimal amount
        invoice = MaterialsInvoice(
            client_id=client.id,
            supplier_id=supplier.id,
            base_amount=Decimal('123.45'),
            status=InvoiceStatus.UNPAID
        )
        db.session.add(invoice)
        db.session.flush()
        
        # Verify invoice base_amount is a Decimal
        assert isinstance(invoice.base_amount, Decimal)
        assert invoice.base_amount == Decimal('123.45')
        
        # Create a transaction with a calculated amount
        transaction_amount = invoice.base_amount * (Decimal('1') + client.markup_rate)
        transaction = Transaction(
            invoice_id=invoice.id,
            amount=transaction_amount
        )
        db.session.add(transaction)
        
        # Create debts
        client_debt = Debt(
            invoice_id=invoice.id,
            party="client",
            amount=transaction_amount
        )
        
        supplier_debt = Debt(
            invoice_id=invoice.id,
            party="supplier",
            amount=invoice.base_amount
        )
        
        db.session.add_all([client_debt, supplier_debt])
        db.session.commit()
        
        # Retrieve objects from database and verify decimal types
        retrieved_invoice = db.session.query(MaterialsInvoice).filter_by(id=invoice.id).first()
        assert isinstance(retrieved_invoice.base_amount, Decimal)
        assert retrieved_invoice.base_amount == Decimal('123.45')
        
        retrieved_transaction = db.session.query(Transaction).filter_by(id=transaction.id).first()
        assert isinstance(retrieved_transaction.amount, Decimal)
        
        retrieved_client_debt = db.session.query(Debt).filter_by(party="client").first()
        assert isinstance(retrieved_client_debt.amount, Decimal)
        
        retrieved_supplier_debt = db.session.query(Debt).filter_by(party="supplier").first()
        assert isinstance(retrieved_supplier_debt.amount, Decimal)
        assert retrieved_supplier_debt.amount == Decimal('123.45')
        
def test_decimal_calculations(app, init_database):
    """Test that decimal calculations maintain exact precision."""
    with app.app_context():
        # Get fresh instances of client and supplier from the database
        client_id = init_database['client_id']
        supplier_id = init_database['supplier_id']
        
        client = db.session.query(Client).filter_by(id=client_id).first()
        supplier = db.session.query(Supplier).filter_by(id=supplier_id).first()
        
        # Test a specific calculation
        base_amount = Decimal('123.45')
        markup_rate = Decimal('0.15')
        
        # Calculate the expected result
        expected_amount = base_amount * (Decimal('1') + markup_rate)
        # Note: The expected is 141.9675, but with 2 decimal places it would be 141.97
        expected_rounded = Decimal(str(expected_amount)).quantize(Decimal('0.01'))
        
        # Create invoice and transaction
        invoice = MaterialsInvoice(
            client_id=client.id,
            supplier_id=supplier.id,
            base_amount=base_amount,
            status=InvoiceStatus.UNPAID
        )
        db.session.add(invoice)
        db.session.flush()
        
        # Calculate transaction amount
        transaction_amount = invoice.base_amount * (Decimal('1') + client.markup_rate)
        transaction = Transaction(
            invoice_id=invoice.id,
            amount=transaction_amount
        )
        db.session.add(transaction)
        db.session.commit()
        
        # Verify the calculation is correct up to 2 decimal places
        assert transaction.amount.quantize(Decimal('0.01')) == expected_rounded
        
        # Log the values for debugging
        print(f"Base amount: {base_amount}")
        print(f"Markup rate: {markup_rate}")
        print(f"Expected raw: {expected_amount}")
        print(f"Expected rounded: {expected_rounded}")
        print(f"Actual amount: {transaction.amount}")
        
        # Verify the values match when rounded to 2 decimal places
        assert transaction.amount.quantize(Decimal('0.01')) == Decimal('141.97') 