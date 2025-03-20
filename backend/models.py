from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import enum
from typing import List, Optional
from sqlalchemy import Numeric

db = SQLAlchemy()

class InvoiceStatus(enum.Enum):
    """Status options for an invoice."""
    DRAFT = "DRAFT"
    PENDING = "PENDING" 
    PAID = "PAID"
    UNPAID = "UNPAID"

class Client(db.Model):
    """Client model representing organizations that place orders."""
    __tablename__ = 'clients'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    markup_rate = db.Column(Numeric(10, 4), nullable=False)
    # Relationship for easy access to the invoices
    invoices = db.relationship('MaterialsInvoice', backref='client', lazy=True)
    
    def __repr__(self) -> str:
        """String representation of Client."""
        return f"<Client id={self.id} name={self.name}>"

class Supplier(db.Model):
    """Supplier model representing organizations that provide materials."""
    __tablename__ = 'suppliers'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    # Relationship for easy access to the invoices
    invoices = db.relationship('MaterialsInvoice', backref='supplier', lazy=True)
    
    def __repr__(self) -> str:
        """String representation of Supplier."""
        return f"<Supplier id={self.id} name={self.name}>"

class MaterialsInvoice(db.Model):
    """Invoice model for materials purchases."""
    __tablename__ = 'materials_invoices'
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, db.ForeignKey('clients.id'), nullable=False)
    supplier_id = db.Column(db.Integer, db.ForeignKey('suppliers.id'), nullable=False)
    invoice_date = db.Column(db.DateTime, default=datetime.utcnow)
    base_amount = db.Column(Numeric(10, 2), nullable=False)
    status = db.Column(db.Enum(InvoiceStatus), default=InvoiceStatus.UNPAID, nullable=False)

    # One-to-one relationship with Transaction
    transaction = db.relationship('Transaction', uselist=False, backref='invoice')

    # One-to-many relationship with Debt
    debts = db.relationship('Debt', backref='invoice', lazy=True)
    
    def __init__(self, **kwargs):
        """Initialize with validation."""
        super(MaterialsInvoice, self).__init__(**kwargs)
        if 'base_amount' in kwargs and kwargs['base_amount'] <= 0:
            raise ValueError("Base amount must be a positive number")
    
    def __repr__(self) -> str:
        """String representation of MaterialsInvoice."""
        return f"<MaterialsInvoice id={self.id} amount={self.base_amount} status={self.status.name}>"

class Transaction(db.Model):
    """Transaction model for financial exchanges."""
    __tablename__ = 'transactions'
    id = db.Column(db.Integer, primary_key=True)
    invoice_id = db.Column(db.Integer, db.ForeignKey('materials_invoices.id'), nullable=False)
    transaction_date = db.Column(db.DateTime, default=datetime.utcnow)
    amount = db.Column(Numeric(10, 2), nullable=False)
    
    def __repr__(self) -> str:
        """String representation of Transaction."""
        return f"<Transaction id={self.id} amount={self.amount}>"

class Debt(db.Model):
    """Debt model for tracking what is owed by different parties."""
    __tablename__ = 'debts'
    id = db.Column(db.Integer, primary_key=True)
    invoice_id = db.Column(db.Integer, db.ForeignKey('materials_invoices.id'), nullable=False)
    party = db.Column(db.String(50), nullable=False)
    amount = db.Column(Numeric(10, 2), nullable=False)
    created_date = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self) -> str:
        """String representation of Debt."""
        return f"<Debt id={self.id} party={self.party} amount={self.amount}>" 