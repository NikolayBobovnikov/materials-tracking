import pytest
from datetime import datetime
import os
import sys
from decimal import Decimal

# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models import Client, Supplier, MaterialsInvoice, Transaction, Debt, InvoiceStatus

def test_simple():
    """A simple test to ensure pytest is working."""
    assert 1 == 1

def test_models(app_context, populated_db):
    """Test that the database models can be created and queried."""
    # Query the clients
    clients = Client.query.all()
    assert len(clients) > 0
    
    # Query the suppliers
    suppliers = Supplier.query.all()
    assert len(suppliers) > 0
    
    # Create an invoice
    client = Client.query.first()
    supplier = Supplier.query.first()
    
    invoice = MaterialsInvoice(
        client_id=client.id,
        supplier_id=supplier.id,
        invoiceDate=datetime.utcnow(),
        baseAmount=Decimal('100.00'),
        status=InvoiceStatus.UNPAID
    )
    populated_db.session.add(invoice)
    populated_db.session.commit()
    
    # Verify it was created
    assert invoice.id is not None
    assert invoice.baseAmount == Decimal('100.00')

def test_invoice_validation(app_context, populated_db):
    """Test that invoice validation works properly."""
    client = Client.query.first()
    supplier = Supplier.query.first()
    
    # Try creating an invoice with a negative amount
    # This should raise a validation error during object creation
    with pytest.raises(ValueError, match="Base amount must be a positive number"):
        invoice = MaterialsInvoice(
            client_id=client.id,
            supplier_id=supplier.id,
            invoiceDate=datetime.utcnow(),
            baseAmount=Decimal('-100.00'),
            status=InvoiceStatus.UNPAID
        ) 