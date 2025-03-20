import ariadne
from ariadne import ObjectType, QueryType, MutationType, InterfaceType, make_executable_schema
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
    interface Node {
        id: ID!
    }

    type PageInfo {
        hasNextPage: Boolean!
        hasPreviousPage: Boolean!
        startCursor: String
        endCursor: String
    }

    type Query {
        node(id: ID!): Node
        clients(first: Int, after: String): ClientConnection!
        suppliers(first: Int, after: String): SupplierConnection!
        invoices(first: Int, after: String): MaterialsInvoiceConnection!
        transactions(first: Int, after: String): TransactionConnection!
        debts(first: Int, after: String): DebtConnection!
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
    
    type ClientEdge {
        node: Client!
        cursor: String!
    }

    type ClientConnection {
        edges: [ClientEdge]
        pageInfo: PageInfo!
    }
    
    type Client implements Node {
        id: ID!
        name: String!
        markup_rate: Float!
        invoices(first: Int, after: String): MaterialsInvoiceConnection!
    }
    
    type SupplierEdge {
        node: Supplier!
        cursor: String!
    }

    type SupplierConnection {
        edges: [SupplierEdge]
        pageInfo: PageInfo!
    }
    
    type Supplier implements Node {
        id: ID!
        name: String!
        invoices(first: Int, after: String): MaterialsInvoiceConnection!
    }
    
    type MaterialsInvoiceEdge {
        node: MaterialsInvoice!
        cursor: String!
    }

    type MaterialsInvoiceConnection {
        edges: [MaterialsInvoiceEdge]
        pageInfo: PageInfo!
    }
    
    type MaterialsInvoice implements Node {
        id: ID!
        client: Client!
        supplier: Supplier!
        invoice_date: String!
        base_amount: Float!
        status: String!
        transaction: Transaction
        debts(first: Int, after: String): DebtConnection!
    }
    
    type TransactionEdge {
        node: Transaction!
        cursor: String!
    }

    type TransactionConnection {
        edges: [TransactionEdge]
        pageInfo: PageInfo!
    }
    
    type Transaction implements Node {
        id: ID!
        invoice: MaterialsInvoice!
        transaction_date: String!
        amount: Float!
    }
    
    type DebtEdge {
        node: Debt!
        cursor: String!
    }

    type DebtConnection {
        edges: [DebtEdge]
        pageInfo: PageInfo!
    }
    
    type Debt implements Node {
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

# Node interface resolver
node = InterfaceType("Node")

@node.type_resolver
def resolve_node_type(obj, *_):
    # Determine the GraphQL type based on the Python class
    if isinstance(obj, Client):
        return "Client"
    elif isinstance(obj, Supplier):
        return "Supplier"
    elif isinstance(obj, MaterialsInvoice):
        return "MaterialsInvoice"
    elif isinstance(obj, Transaction):
        return "Transaction"
    elif isinstance(obj, Debt):
        return "Debt"
    return None

@query.field("node")
def resolve_node(_, info, id):
    # Parse the global ID to determine type and database ID
    # This is a simple implementation; in production, you'd want to encode/decode IDs properly
    try:
        type_name, database_id = id.split(":")
        if type_name == "Client":
            return Client.query.get(database_id)
        elif type_name == "Supplier":
            return Supplier.query.get(database_id)
        elif type_name == "MaterialsInvoice":
            return MaterialsInvoice.query.get(database_id)
        elif type_name == "Transaction":
            return Transaction.query.get(database_id)
        elif type_name == "Debt":
            return Debt.query.get(database_id)
    except:
        return None
    return None

# Helper function for connections
def get_connection(model_class, first=None, after=None):
    query = model_class.query
    
    # Implement cursor-based pagination
    if after:
        # In a real app, decode the cursor to get the ID
        # Here, we'll assume the cursor is just the ID
        query = query.filter(model_class.id > after)
    
    # Limit results
    if first is not None:
        query = query.limit(first + 1)  # +1 to check if there's a next page
    
    # Execute query
    items = query.all()
    
    # Check if there's a next page
    has_next_page = False
    if first is not None and len(items) > first:
        has_next_page = True
        items = items[:first]
    
    # Create edges
    edges = []
    for item in items:
        # In a real app, encode the cursor
        cursor = str(item.id)
        edges.append({"node": item, "cursor": cursor})
    
    # Create page info
    start_cursor = edges[0]["cursor"] if edges else None
    end_cursor = edges[-1]["cursor"] if edges else None
    page_info = {
        "hasNextPage": has_next_page,
        "hasPreviousPage": after is not None,
        "startCursor": start_cursor,
        "endCursor": end_cursor
    }
    
    return {
        "edges": edges,
        "pageInfo": page_info
    }

# Connection resolvers
@query.field("clients")
def resolve_clients(_, info, first=None, after=None):
    return get_connection(Client, first, after)

@query.field("suppliers")
def resolve_suppliers(_, info, first=None, after=None):
    return get_connection(Supplier, first, after)

@query.field("invoices")
def resolve_invoices(_, info, first=None, after=None):
    return get_connection(MaterialsInvoice, first, after)

@query.field("transactions")
def resolve_transactions(_, info, first=None, after=None):
    return get_connection(Transaction, first, after)

@query.field("debts")
def resolve_debts(_, info, first=None, after=None):
    return get_connection(Debt, first, after)

# Relation connection resolvers
@client.field("invoices")
def resolve_client_invoices(obj, info, first=None, after=None):
    query = MaterialsInvoice.query.filter_by(client_id=obj.id)
    
    # Apply pagination similar to get_connection
    if after:
        query = query.filter(MaterialsInvoice.id > after)
    
    if first is not None:
        query = query.limit(first + 1)
    
    items = query.all()
    
    has_next_page = False
    if first is not None and len(items) > first:
        has_next_page = True
        items = items[:first]
    
    edges = []
    for item in items:
        cursor = str(item.id)
        edges.append({"node": item, "cursor": cursor})
    
    start_cursor = edges[0]["cursor"] if edges else None
    end_cursor = edges[-1]["cursor"] if edges else None
    page_info = {
        "hasNextPage": has_next_page,
        "hasPreviousPage": after is not None,
        "startCursor": start_cursor,
        "endCursor": end_cursor
    }
    
    return {
        "edges": edges,
        "pageInfo": page_info
    }

@supplier.field("invoices")
def resolve_supplier_invoices(obj, info, first=None, after=None):
    query = MaterialsInvoice.query.filter_by(supplier_id=obj.id)
    
    # Apply pagination similar to get_connection
    if after:
        query = query.filter(MaterialsInvoice.id > after)
    
    if first is not None:
        query = query.limit(first + 1)
    
    items = query.all()
    
    has_next_page = False
    if first is not None and len(items) > first:
        has_next_page = True
        items = items[:first]
    
    edges = []
    for item in items:
        cursor = str(item.id)
        edges.append({"node": item, "cursor": cursor})
    
    start_cursor = edges[0]["cursor"] if edges else None
    end_cursor = edges[-1]["cursor"] if edges else None
    page_info = {
        "hasNextPage": has_next_page,
        "hasPreviousPage": after is not None,
        "startCursor": start_cursor,
        "endCursor": end_cursor
    }
    
    return {
        "edges": edges,
        "pageInfo": page_info
    }

@materials_invoice.field("debts")
def resolve_invoice_debts(obj, info, first=None, after=None):
    query = Debt.query.filter_by(invoice_id=obj.id)
    
    # Apply pagination similar to get_connection
    if after:
        query = query.filter(Debt.id > after)
    
    if first is not None:
        query = query.limit(first + 1)
    
    items = query.all()
    
    has_next_page = False
    if first is not None and len(items) > first:
        has_next_page = True
        items = items[:first]
    
    edges = []
    for item in items:
        cursor = str(item.id)
        edges.append({"node": item, "cursor": cursor})
    
    start_cursor = edges[0]["cursor"] if edges else None
    end_cursor = edges[-1]["cursor"] if edges else None
    page_info = {
        "hasNextPage": has_next_page,
        "hasPreviousPage": after is not None,
        "startCursor": start_cursor,
        "endCursor": end_cursor
    }
    
    return {
        "edges": edges,
        "pageInfo": page_info
    }

# Create executable schema
schema = make_executable_schema(
    type_defs, 
    query, 
    mutation,
    client,
    supplier,
    materials_invoice,
    transaction,
    debt,
    node
) 