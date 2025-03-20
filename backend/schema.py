import ariadne
from ariadne import ObjectType, QueryType, MutationType, make_executable_schema
from ariadne.asgi import GraphQL
from graphql import GraphQLError
from datetime import datetime
from sqlalchemy.exc import SQLAlchemyError
import logging
from decimal import Decimal

from backend.models import db, Client, Supplier, MaterialsInvoice, Transaction, Debt, InvoiceStatus

# Get logger
logger = logging.getLogger(__name__)

# Define type definitions using SDL (Schema Definition Language)
type_defs = """
    type Query {
        clients: [Client!]!
        suppliers: [Supplier!]!
        invoices: [MaterialsInvoice!]!
        transactions: [Transaction!]!
        debts: [Debt!]!
        client(id: ID!): Client
        supplier(id: ID!): Supplier
        invoice(id: ID!): MaterialsInvoice
        transaction(id: ID!): Transaction
        debt(id: ID!): Debt
    }
    
    type Mutation {
        createMaterialsInvoice(
            clientId: ID!
            supplierId: ID!
            invoiceDate: String!
            baseAmount: Float!
            status: String
        ): MaterialsInvoicePayload!
    }
    
    type MaterialsInvoicePayload {
        invoice: MaterialsInvoice
        errors: [String]
    }
    
    type Client {
        id: ID!
        name: String!
        markup_rate: Float!
        invoices: [MaterialsInvoice!]!
    }
    
    type Supplier {
        id: ID!
        name: String!
        invoices: [MaterialsInvoice!]!
    }
    
    type MaterialsInvoice {
        id: ID!
        client: Client!
        supplier: Supplier!
        invoice_date: String!
        base_amount: Float!
        status: String!
        transaction: Transaction
        debts: [Debt!]!
    }
    
    type Transaction {
        id: ID!
        invoice: MaterialsInvoice!
        transaction_date: String!
        amount: Float!
    }
    
    type Debt {
        id: ID!
        invoice: MaterialsInvoice!
        party: String!
        amount: Float!
        created_date: String!
    }
"""

# Setup resolvers
query = QueryType()
mutation = MutationType()

# Query resolvers
@query.field("clients")
def resolve_clients(*_):
    return Client.query.all()

@query.field("suppliers")
def resolve_suppliers(*_):
    return Supplier.query.all()

@query.field("invoices")
def resolve_invoices(*_):
    return MaterialsInvoice.query.all()

@query.field("transactions")
def resolve_transactions(*_):
    return Transaction.query.all()

@query.field("debts")
def resolve_debts(*_):
    return Debt.query.all()

@query.field("client")
def resolve_client(_, info, id):
    return Client.query.get(id)

@query.field("supplier")
def resolve_supplier(_, info, id):
    return Supplier.query.get(id)

@query.field("invoice")
def resolve_invoice(_, info, id):
    return MaterialsInvoice.query.get(id)

@query.field("transaction")
def resolve_transaction(_, info, id):
    return Transaction.query.get(id)

@query.field("debt")
def resolve_debt(_, info, id):
    return Debt.query.get(id)

# Type resolvers
client = ObjectType("Client")
supplier = ObjectType("Supplier")
materials_invoice = ObjectType("MaterialsInvoice")
transaction = ObjectType("Transaction")
debt = ObjectType("Debt")

@client.field("invoices")
def resolve_client_invoices(obj, *_):
    return MaterialsInvoice.query.filter_by(client_id=obj.id).all()

@supplier.field("invoices")
def resolve_supplier_invoices(obj, *_):
    return MaterialsInvoice.query.filter_by(supplier_id=obj.id).all()

@materials_invoice.field("client")
def resolve_invoice_client(obj, *_):
    return Client.query.get(obj.client_id)

@materials_invoice.field("supplier")
def resolve_invoice_supplier(obj, *_):
    return Supplier.query.get(obj.supplier_id)

@materials_invoice.field("transaction")
def resolve_invoice_transaction(obj, *_):
    return Transaction.query.filter_by(invoice_id=obj.id).first()

@materials_invoice.field("debts")
def resolve_invoice_debts(obj, *_):
    return Debt.query.filter_by(invoice_id=obj.id).all()

@transaction.field("invoice")
def resolve_transaction_invoice(obj, *_):
    return MaterialsInvoice.query.get(obj.invoice_id)

@debt.field("invoice")
def resolve_debt_invoice(obj, *_):
    return MaterialsInvoice.query.get(obj.invoice_id)

# Mutation resolvers
@mutation.field("createMaterialsInvoice")
def resolve_create_materials_invoice(_, info, clientId, supplierId, invoiceDate, baseAmount, status=None):
    """Create a materials invoice with associated transaction and debts.
    
    Args:
        clientId: The ID of the client
        supplierId: The ID of the supplier
        invoiceDate: The date of the invoice (ISO format string)
        baseAmount: The base amount of the invoice
        status: Optional status for the invoice
        
    Returns:
        A dictionary with the created invoice or errors
    """
    logger.info(f"Creating new materials invoice: client={clientId}, supplier={supplierId}, amount={baseAmount}")
    
    try:
        # Convert baseAmount to Decimal for precision
        base_amount = Decimal(str(baseAmount))
        
        # Parse invoice date
        invoice_date = datetime.fromisoformat(invoiceDate)
        
        # Validate existence
        client = Client.query.get(clientId)
        if not client:
            logger.error(f"Client not found for ID={clientId}")
            return {"invoice": None, "errors": [f"Client not found for ID={clientId}"]}
            
        supplier = Supplier.query.get(supplierId)
        if not supplier:
            logger.error(f"Supplier not found for ID={supplierId}")
            return {"invoice": None, "errors": [f"Supplier not found for ID={supplierId}"]}
            
        # Validate amounts
        if base_amount <= 0:
            logger.error(f"Invalid base_amount: {base_amount}. Must be positive.")
            return {"invoice": None, "errors": ["Base amount must be a positive number."]}
            
        if client.markup_rate < 0:
            logger.error(f"Invalid markup_rate: {client.markup_rate}. Must be >= 0.")
            return {"invoice": None, "errors": [f"Invalid markup_rate: {client.markup_rate}. Must be >= 0."]}
            
        # Additional validation: prevent client and supplier from being the same
        if clientId == supplierId:
            logger.error(f"Client and supplier cannot be the same entity")
            return {"invoice": None, "errors": ["Client and supplier cannot be the same entity."]}

        with db.session.begin():
            # Set default status to UNPAID if not provided
            invoice_status = InvoiceStatus.UNPAID
            if status:
                try:
                    invoice_status = InvoiceStatus[status]
                except KeyError:
                    return {"invoice": None, "errors": [
                        f"Invalid status: {status}. Must be one of: {', '.join([s.name for s in InvoiceStatus])}"
                    ]}
            
            invoice = MaterialsInvoice(
                client_id=clientId,
                supplier_id=supplierId,
                invoice_date=invoice_date,
                base_amount=base_amount,
                status=invoice_status
            )
            db.session.add(invoice)
            db.session.flush()  # to generate invoice ID

            # Transaction and Debt logic
            transaction_amount = invoice.base_amount * (1 + client.markup_rate)
            transaction = Transaction(
                invoice_id=invoice.id,
                transaction_date=datetime.utcnow(),
                amount=transaction_amount,
            )
            db.session.add(transaction)

            client_debt = Debt(
                invoice_id=invoice.id,
                party="client",
                amount=transaction_amount,
                created_date=datetime.utcnow()
            )
            supplier_debt = Debt(
                invoice_id=invoice.id,
                party="supplier",
                amount=invoice.base_amount,
                created_date=datetime.utcnow()
            )
            db.session.add(client_debt)
            db.session.add(supplier_debt)
            
            logger.info(f"Created invoice ID={invoice.id} with transaction amount={transaction_amount}")
            
        return {"invoice": invoice, "errors": None}
            
    except SQLAlchemyError as e:
        logger.error(f"Database error during invoice creation: {str(e)}")
        return {"invoice": None, "errors": [f"Database error during invoice creation: {str(e)}"]}
    except Exception as e:
        logger.error(f"Error creating invoice: {str(e)}")
        return {"invoice": None, "errors": [f"Error creating invoice: {str(e)}"]}

# Create executable schema
schema = make_executable_schema(
    type_defs, 
    query, 
    mutation,
    client,
    supplier,
    materials_invoice,
    transaction,
    debt
) 