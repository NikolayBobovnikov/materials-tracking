"""
GraphQL Resolvers for Financial Management Application

This module defines all the GraphQL resolvers used by the Ariadne schema-first implementation.
It includes resolvers for all types, fields, queries, and mutations.

All financial values (like markup_rate, base_amount, amount) are stored as Decimal types
in the database but converted to float for GraphQL compatibility.

Key components:
- Type resolvers: Convert between database models and GraphQL types
- Field resolvers: Handle specific field conversions (especially Decimal to float)
- Query resolvers: Retrieve data from database
- Mutation resolvers: Create or modify data with proper validation
"""

from ariadne import ObjectType, QueryType, MutationType
from decimal import Decimal
from models import Client, Supplier, MaterialsInvoice, Transaction, Debt, InvoiceStatus
from models import db
from datetime import datetime

# Define types
query = QueryType()
mutation = MutationType()
client_type = ObjectType("Client")
supplier_type = ObjectType("Supplier")
materials_invoice_type = ObjectType("MaterialsInvoice")
transaction_type = ObjectType("Transaction")
debt_type = ObjectType("Debt")

# Query resolvers
@query.field("clients")
def resolve_clients(*_):
    return Client.query.all()

@query.field("client")
def resolve_client(_, info, id):
    return Client.query.filter_by(id=id).first()

@query.field("suppliers")
def resolve_suppliers(*_):
    return Supplier.query.all()

@query.field("supplier")
def resolve_supplier(_, info, id):
    return Supplier.query.filter_by(id=id).first()

@query.field("invoices")
def resolve_invoices(*_):
    return MaterialsInvoice.query.all()

@query.field("invoice")
def resolve_invoice(_, info, id):
    return MaterialsInvoice.query.filter_by(id=id).first()

# Type resolvers
@client_type.field("markup_rate")
def resolve_markup_rate(obj, info):
    # Convert Decimal to float for GraphQL
    return float(obj.markup_rate)

@materials_invoice_type.field("client")
def resolve_invoice_client(invoice, info):
    return Client.query.filter_by(id=invoice.client_id).first()

@materials_invoice_type.field("supplier")
def resolve_invoice_supplier(invoice, info):
    return Supplier.query.filter_by(id=invoice.supplier_id).first()

@materials_invoice_type.field("base_amount")
def resolve_base_amount(invoice, info):
    # Convert Decimal to float for GraphQL
    return float(invoice.base_amount)

@materials_invoice_type.field("transaction")
def resolve_invoice_transaction(invoice, info):
    return Transaction.query.filter_by(invoice_id=invoice.id).first()

@materials_invoice_type.field("debts")
def resolve_invoice_debts(invoice, info):
    return Debt.query.filter_by(invoice_id=invoice.id).all()

@transaction_type.field("amount")
def resolve_transaction_amount(transaction, info):
    # Convert Decimal to float for GraphQL
    return float(transaction.amount)

@debt_type.field("amount")
def resolve_debt_amount(debt, info):
    # Convert Decimal to float for GraphQL
    return float(debt.amount)

# Mutation resolvers
# Note: The createMaterialsInvoice mutation has been moved to schema.py
# to consolidate resolver logic and prevent duplication 