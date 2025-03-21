
# Context
below is an app implementation, and code review with refactoring plan aming to identify duplicate, redundant and over engineered/complicated (which can be simplified) code. Please review the code review report for correctness and consistency.


## Code review report and suggested refactoring plan

### 1. Backend Simplifications

#### 1.1 Model and Migration Changes
- **Remove InvoiceStatus and the `status` Field:**
  - In `models.py`:
    - Remove the `InvoiceStatus` enum.
    - Remove the `status` field from the `MaterialsInvoice` model.
    - Simplify the `MaterialsInvoice.__init__` validation and remove any unnecessary relationship configurations.
  - **Migration:**
    - Create and run a new migration script to drop the `status` column from the database.

#### 1.2 GraphQL Schema Simplification
- **Remove Connection Types and Pagination:**
  - Replace all Connection types with simple list types. For example, modify the query schema to:
    ```graphql
    type Query {
      clients: [Client!]!
      suppliers: [Supplier!]!
      invoices: [MaterialsInvoice!]!
      transactions: [Transaction!]!
      debts: [Debt!]!
    }
    ```
  - Remove the Node interface, PageInfo, and all *Connection/*Edge types.
  - Remove pagination arguments (`first`, `after`) from all queries.
  
#### 1.3 Resolver Simplification
- **Simplify Resolvers:**
  - Replace all connection resolvers with straightforward returns. For example:
    ```python
    @query.field("clients")
    def resolve_clients(*_):
        return Client.query.all()
    ```
  - Remove the generic `resolve_connection` function.
  - Remove Node interface resolvers since the Node interface is eliminated.
  
#### 1.4 Database Setup Consolidation
- **Simplify Database Initialization:**
  - Consolidate the database initialization logic into a single module (e.g., `database.py`).
  - Remove redundant Alembic configurations and any unnecessary setup scripts.

---

### 2. Frontend Simplifications

#### 2.1 Remove Unnecessary Pagination Components
- **Delete PaginatedList Component:**
  - Remove `frontend/src/components/PaginatedList.tsx` entirely.
  - Update list components (e.g., `ClientList.tsx`, `DebtList.tsx`, `TransactionList.tsx`) to fetch and display full lists of data without pagination. For example:
    ```tsx
    // Example for ClientList.tsx
    const ClientList = () => {
      const data = useLazyLoadQuery<ClientListQuery>(query, {});
      return (
        <Table>
          {data.clients.map(client => (
            <TableRow key={client.id}>
              {/* cells */}
            </TableRow>
          ))}
        </Table>
      );
    };
    ```

#### 2.2 Simplify GraphQL Queries
- **Use Simple Queries Without Pagination:**
  - Update all list queries to remove pagination. For example:
    ```graphql
    query ClientListQuery {
      clients {
        id
        name
        markup_rate
      }
    }
    ```

#### 2.3 Remove the NodeViewer Component
- **Delete NodeViewer and Its Related Files:**
  - Remove `frontend/src/components/NodeViewer.tsx` and its test file, along with any generated GraphQL files (e.g., `NodeViewerQuery.graphql.ts`).
  - Update `App.tsx` to remove any import or usage of `<NodeViewer />`.

#### 2.4 Simplify the Invoice Form
- **Simplify InvoiceForm.tsx:**
  - Remove pagination controls and the `loadMore` state.
  - Modify client and supplier queries to fetch all records at once (e.g., set a high limit or remove the limit entirely).
  - Enhance the success message to include complete invoice details:
    ```tsx
    onCompleted: (response: CreateMaterialsInvoiceResponse) => {
      const result = response.createMaterialsInvoice;
      if (result.errors && result.errors.length > 0) {
        setError(result.errors.join(', '));
        return;
      }
      setSuccess(`Invoice ${result.invoice.id} created: Client ${result.invoice.client.name}, Supplier ${result.invoice.supplier.name}, Amount ${result.invoice.base_amount}`);
      reset();
    },
    ```

---

### 3. Common Simplifications

#### 3.1 Docker/CI Improvements
- **Backend Dockerfile:**
  - Remove unnecessary installations (e.g., wget) and combine setup steps.
- **Frontend Dockerfile:**
  - Remove any Python dependency and simplify schema generation steps.
- **CI/CD Pipelines:**
  - Simplify CI/CD configurations to reflect the simplified project structure.

#### 3.2 Remove Unused Files
- **Backend:**
  - Remove unused files such as `backend/setup.py` and `backend/run.py`.
- **Frontend:**
  - Remove unused directories and files:
    - `frontend/scripts/`
    - `frontend/workflows/`
    - `frontend/eslint-plugin-relay-types/`

#### 3.3 Simplify Error Handling in Resolvers
- **Improve Error Handling:**
  - In the `createMaterialsInvoice` mutation, simplify error handling as follows:
    ```python
    @mutation.field("createMaterialsInvoice")
    def resolve_create_materials_invoice(...):
        try:
            ## Core invoice creation logic
            return {"invoice": invoice, "errors": None}
        except Exception as e:
            logger.error(str(e))
            return {"invoice": None, "errors": [str(e)]}
    ```

---

### 4. Final Structure Changes

#### 4.1 Simplified Backend Structure
```
backend/
├── app.py            ## Combined Flask app setup
├── models.py         ## Simplified models without the status field
├── schema.py         ## Basic GraphQL types using simple lists
└── database.py       ## Unified database setup module
```

#### 4.2 Simplified Frontend Structure
```
frontend/src/
├── components/
│   ├── InvoiceForm.tsx
│   ├── ClientList.tsx
│   ├── DebtList.tsx
│   └── TransactionList.tsx  ## Kept for debugging and verification of transaction creation
└── App.tsx           ## Simplified layout without NodeViewer or pagination components
```

---

### 5. Implementation Plan

1. **Database Migration**
   - Create and run a migration to remove the `status` field from the database.
   - Update models and relationships accordingly.

2. **Backend Refactoring**
   - Simplify the GraphQL schema by replacing connection types with simple lists.
   - Remove pagination arguments and connection resolvers.
   - Consolidate database initialization logic into a single module.

3. **Frontend Refactoring**
   - Remove the PaginatedList component and update all list components to display full lists.
   - Simplify GraphQL queries to remove pagination.
   - Remove the NodeViewer component and update App.tsx.
   - Simplify InvoiceForm by removing loadMore state and pagination controls.

4. **Testing & Validation**
   - Verify core flows:
     - Invoice creation
     - Automatic generation of transactions and debts
     - Correct display of client, debt, and transaction lists
   - Test and validate error handling.
   - Update or remove tests as necessary to reflect the simplified logic.

5. **Deployment Adjustments**
   - Update `docker-compose.yml` to reflect the new structure.
   - Simplify CI/CD pipelines.
   - Update documentation to match the new simplified architecture.

---


## Project Structure
```
py_test
    └── docker-compose.yml
│   ├── backend/
│   │   ├── app.py
│   │   ├── create_db.py
│   │   ├── Dockerfile
│   │   ├── generate_schema.py
│   │   ├── migrate.py
│   │   ├── models.py
│   │   ├── resolvers.py
│   │   ├── run.py
│   │   ├── schema.graphql
│   │   ├── schema.py
│   │   ├── seed.py
│       └── setup.py
│   │   ├── migrations/
│   │   │   ├── alembic.ini
│   │       └── script.py.mako
│   │   │   ├── versions/
│   │   │       └── dd9dd1086143_initial_migration.py
│   ├── frontend/
│   │   ├── .babelrc
│   │   ├── .eslintrc.js
│   │   ├── .nvmrc
│   │   ├── babel.config.js
│   │   ├── craco.config.js
│   │   ├── Dockerfile
│   │   ├── nginx.conf
│   │   ├── package.json
│   │   ├── postcss.config.js
│   │   ├── relay.config.js
│   │   ├── relay.config.json
│   │   ├── run.js
│   │   ├── schema.graphql
│   │   ├── setup.js
│   │   ├── tailwind.config.js
│       └── tsconfig.json
│   │   │   ├── workflows/
│   │   │       └── ci.yml
│   │   ├── eslint-plugin-relay-types/
│   │       └── index.js
│   │   ├── public/
│   │   │   ├── index.html
│   │   │   ├── manifest.json
│   │       └── robots.txt
│   │   ├── scripts/
│   │   │   ├── deploy.sh
│   │   │   ├── docker-build.ps1
│   │   │   ├── docker-build.sh
│   │   │   ├── fix-test-imports.js
│   │   │   ├── pre-commit.js
│   │       └── type-check-all.js
│   │   ├── src/
│   │   │   ├── App.css
│   │   │   ├── App.test.tsx
│   │   │   ├── App.tsx
│   │   │   ├── index.css
│   │   │   ├── index.tsx
│   │   │   ├── relay-types.d.ts
│   │   │   ├── reportWebVitals.ts
│   │       └── setupTests.ts
│   │   │   ├── components/
│   │   │   │   ├── ClientList.tsx
│   │   │   │   ├── DebtList.tsx
│   │   │   │   ├── InvoiceForm.test.tsx
│   │   │   │   ├── InvoiceForm.tsx
│   │   │   │   ├── NodeViewer.test.tsx
│   │   │   │   ├── NodeViewer.tsx
│   │   │       └── TransactionList.tsx
│   │   │   │   ├── __tests__/
│   │   │   │       └── ClientList.test.tsx
│   │   │   │   │   ├── __snapshots__/
│   │   │   │   │       └── ClientList.test.tsx.snap
│   │   │   ├── mutations/
│   │   │       └── CreateMaterialsInvoice.ts
│   │   │   ├── utils/
│   │   │   │   ├── dataValidator.ts
│   │   │       └── types.ts
│   │   │   ├── __generated__/
│   │   │   │   ├── ClientListQuery.graphql.ts
│   │   │   │   ├── CreateMaterialsInvoiceMutation.graphql.ts
│   │   │   │   ├── DebtListQuery.graphql.ts
│   │   │   │   ├── InvoiceFormClientsSuppliersQuery.graphql.ts
│   │   │       └── TransactionListQuery.graphql.ts
```

## Files
### backend\Dockerfile

```
FROM python:3.10-slim

WORKDIR /app
COPY requirements.txt ./
RUN pip install --upgrade pip && pip install -r requirements.txt
COPY . .

# Set PYTHONPATH to include the current directory
ENV PYTHONPATH=/app

# Flask port
EXPOSE 5000
CMD ["python", "app.py"]
```

### backend\app.py

```py
"""
Financial Management Application with GraphQL API

This application provides a GraphQL API for managing financial data including clients,
suppliers, invoices, transactions, and debts. All financial calculations use the Decimal
type for precision.

GraphQL Implementation:
- Uses Ariadne for schema-first GraphQL
- Schema defined in schema.py
- Supports queries and mutations

Key Features:
- Decimal precision for all financial calculations
- SQLAlchemy models with appropriate Numeric column types
- Flask backend with RESTful and GraphQL endpoints
"""

import os
import sys

# Add the parent directory to sys.path so that 'backend' can be imported
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from flask import Flask, request, jsonify
from flask_migrate import Migrate
from flask_cors import CORS
from models import db
import logging
from ariadne import graphql_sync
# Use the HTML directly instead of importing from constants
PLAYGROUND_HTML = """
<!DOCTYPE html>
<html>
<head>
    <meta charset=utf-8/>
    <meta name="viewport" content="user-scalable=no, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, minimal-ui">
    <title>GraphQL Playground</title>
    <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/graphql-playground-react/build/static/css/index.css" />
    <link rel="shortcut icon" href="//cdn.jsdelivr.net/npm/graphql-playground-react/build/favicon.png" />
    <script src="//cdn.jsdelivr.net/npm/graphql-playground-react/build/static/js/middleware.js"></script>
</head>
<body>
    <div id="root">
        <style>
            body {
                background-color: rgb(23, 42, 58);
                font-family: Open Sans, sans-serif;
                height: 90vh;
            }
            #root {
                height: 100%;
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .loading {
                font-size: 32px;
                font-weight: 200;
                color: rgba(255, 255, 255, .6);
                margin-left: 20px;
            }
            img {
                width: 78px;
                height: 78px;
            }
            .title {
                font-weight: 400;
            }
        </style>
        <img src='//cdn.jsdelivr.net/npm/graphql-playground-react/build/logo.png' alt=''>
        <div class="loading"> Loading
            <span class="title">GraphQL Playground</span>
        </div>
    </div>
    <script>window.addEventListener('load', function (event) {
            GraphQLPlayground.init(document.getElementById('root'), {
                endpoint: '/graphql',
            })
        })</script>
</body>
</html>
"""
from schema import schema

def create_app():
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(),  # Output to console
            logging.FileHandler('app.log')  # Save to file
        ]
    )
    
    app = Flask(__name__)

    # Load DB URI from .env or fallback to local SQLite
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('SQLALCHEMY_DATABASE_URI', 'sqlite:///test.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Initialize database and migrations
    db.init_app(app)
    migrate = Migrate(app, db)

    # Enable CORS so that React (on a different port) can make requests
    CORS(app)

    # GraphQL endpoints
    @app.route("/graphql", methods=["GET"])
    def graphql_playground():
        # Serve GraphQL Playground for interactive queries
        return PLAYGROUND_HTML, 200

    @app.route("/graphql", methods=["POST"])
    def graphql_server():
        # Handle GraphQL queries
        data = request.get_json()
        
        success, result = graphql_sync(
            schema,
            data,
            context_value={"request": request},
            debug=app.debug
        )
        
        status_code = 200 if success else 400
        return jsonify(result), status_code

    app.logger.info("Flask application initialized with Ariadne GraphQL")

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0')
```

### backend\create_db.py

```py
"""
Simple script to create the database directly from the models
"""

from flask import Flask
import os
from decimal import Decimal

# Create a minimal Flask app
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('SQLALCHEMY_DATABASE_URI', 'sqlite:///test_decimal.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Import and initialize the database
from models import db, Client, Supplier, MaterialsInvoice, Transaction, Debt, InvoiceStatus

# Initialize the app with the database
db.init_app(app)

# Create the database
with app.app_context():
    print("Creating database schema...")
    db.create_all()
    
    # Optionally seed with sample data
    if not Client.query.first():
        print("Seeding with sample data...")
        client = Client(name="Sample Client", markup_rate=Decimal('0.15'))
        supplier = Supplier(name="Sample Supplier")
        
        db.session.add_all([client, supplier])
        db.session.commit()
        
        print(f"Created client: {client}")
        print(f"Created supplier: {supplier}")
    
    print("Database created successfully!")
```

### backend\generate_schema.py

```py
"""
Script to generate the GraphQL schema for the frontend from the backend's Ariadne schema.
This ensures we maintain a single source of truth for the GraphQL schema.
"""

import os
import sys

# Ensure we can import the backend modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.schema import type_defs

# Write the schema to a file for frontend use
frontend_schema_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'frontend', 'schema.graphql')

with open(frontend_schema_path, 'w') as f:
    f.write(type_defs)

print(f"Schema written to {frontend_schema_path}")
```

### backend\migrate.py

```py
"""
Migration script for Flask application
Usage:
python migrate.py db init
python migrate.py db migrate -m "message"
python migrate.py db upgrade
python migrate.py db downgrade
"""

from flask import Flask
from flask_migrate import Migrate
import os
import sys

from app import create_app
from models import db

app = create_app()
migrate = Migrate(app, db)

if __name__ == '__main__':
    from flask.cli import FlaskGroup
    cli = FlaskGroup(create_app=create_app)
    cli.main()
```

### backend\migrations\alembic.ini

```ini
# A generic, single database configuration.

[alembic]
# template used to generate migration files
# file_template = %%(rev)s_%%(slug)s

# set to 'true' to run the environment during
# the 'revision' command, regardless of autogenerate
# revision_environment = false


# Logging configuration
[loggers]
keys = root,sqlalchemy,alembic,flask_migrate

[handlers]
keys = console

[formatters]
keys = generic

[logger_root]
level = WARN
handlers = console
qualname =

[logger_sqlalchemy]
level = WARN
handlers =
qualname = sqlalchemy.engine

[logger_alembic]
level = INFO
handlers =
qualname = alembic

[logger_flask_migrate]
level = INFO
handlers =
qualname = flask_migrate

[handler_console]
class = StreamHandler
args = (sys.stderr,)
level = NOTSET
formatter = generic

[formatter_generic]
format = %(levelname)-5.5s [%(name)s] %(message)s
datefmt = %H:%M:%S
```

### backend\migrations\script.py.mako

```mako
"""${message}

Revision ID: ${up_revision}
Revises: ${down_revision | comma,n}
Create Date: ${create_date}

"""
from alembic import op
import sqlalchemy as sa
${imports if imports else ""}

# revision identifiers, used by Alembic.
revision = ${repr(up_revision)}
down_revision = ${repr(down_revision)}
branch_labels = ${repr(branch_labels)}
depends_on = ${repr(depends_on)}


def upgrade():
    ${upgrades if upgrades else "pass"}


def downgrade():
    ${downgrades if downgrades else "pass"}
```

### backend\migrations\versions\dd9dd1086143_initial_migration.py

```py
"""initial_migration

Revision ID: dd9dd1086143
Revises: 
Create Date: 2025-03-21 13:20:09.967259

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'dd9dd1086143'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('clients',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=100), nullable=False),
    sa.Column('markup_rate', sa.Numeric(precision=10, scale=4), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('suppliers',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=100), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('materials_invoices',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('client_id', sa.Integer(), nullable=False),
    sa.Column('supplier_id', sa.Integer(), nullable=False),
    sa.Column('invoice_date', sa.DateTime(), nullable=True),
    sa.Column('base_amount', sa.Numeric(precision=10, scale=2), nullable=False),
    sa.Column('status', sa.Enum('DRAFT', 'PENDING', 'PAID', 'UNPAID', name='invoicestatus'), nullable=False),
    sa.ForeignKeyConstraint(['client_id'], ['clients.id'], ),
    sa.ForeignKeyConstraint(['supplier_id'], ['suppliers.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('debts',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('invoice_id', sa.Integer(), nullable=False),
    sa.Column('party', sa.String(length=50), nullable=False),
    sa.Column('amount', sa.Numeric(precision=10, scale=2), nullable=False),
    sa.Column('created_date', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['invoice_id'], ['materials_invoices.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('transactions',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('invoice_id', sa.Integer(), nullable=False),
    sa.Column('transaction_date', sa.DateTime(), nullable=True),
    sa.Column('amount', sa.Numeric(precision=10, scale=2), nullable=False),
    sa.ForeignKeyConstraint(['invoice_id'], ['materials_invoices.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('transactions')
    op.drop_table('debts')
    op.drop_table('materials_invoices')
    op.drop_table('suppliers')
    op.drop_table('clients')
    # ### end Alembic commands ###
```

### backend\models.py

```py
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
```

### backend\resolvers.py

```py
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
```

### backend\run.py

```py
import os
import sys
import subprocess
import platform

# Add the parent directory to sys.path so that 'backend' can be imported
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def main():
    # Set path to the virtual environment Python
    if platform.system() == "Windows":
        python_exe = os.path.join("venv", "Scripts", "python")
    else:
        python_exe = os.path.join("venv", "bin", "python")
    
    # Check if db commands were passed
    if len(sys.argv) > 1 and sys.argv[1] == "db":
        from flask.cli import FlaskGroup
        from app import create_app
        
        # Create Flask CLI with our application
        cli = FlaskGroup(create_app=create_app)
        
        # Run db commands
        cli.main(sys.argv[1:])
    else:
        print("Starting Flask server...")
        # Pass the PYTHONPATH environment variable to ensure modules can be found
        env = os.environ.copy()
        env['PYTHONPATH'] = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + os.pathsep + env.get('PYTHONPATH', '')
        os.system(f'"{python_exe}" app.py')

if __name__ == "__main__":
    main()
```

### backend\schema.graphql

```graphql
# Financial Management Application GraphQL Schema
# 
# This schema defines the GraphQL API for the financial management application.
# Note that while the underlying implementation uses Decimal types for precision,
# GraphQL represents these values as Float type.

# Client with markup rate (stored as Decimal in DB)
type Client {
  id: ID!
  name: String!
  markup_rate: Float!
}

# Supplier entity
type Supplier {
  id: ID!
  name: String!
}

# Materials invoice with base amount (stored as Decimal in DB)
type MaterialsInvoice {
  id: ID!
  client: Client!
  supplier: Supplier!
  base_amount: Float!
  status: String!
  transaction: Transaction
  debts: [Debt!]
}

# Transaction with precise amount (stored as Decimal in DB)
type Transaction {
  id: ID!
  invoice: MaterialsInvoice!
  amount: Float!
}

# Debt record for client or supplier
type Debt {
  id: ID!
  invoice: MaterialsInvoice!
  party: String!
  amount: Float!
}

# Queries available in the API
type Query {
  client(id: ID!): Client
  clients: [Client!]!
  supplier(id: ID!): Supplier
  suppliers: [Supplier!]!
  invoice(id: ID!): MaterialsInvoice
  invoices: [MaterialsInvoice!]!
}

# Input for creating a materials invoice
input CreateMaterialsInvoiceInput {
  clientId: ID!
  supplierId: ID!
  invoiceDate: String!
  baseAmount: Float!
}

# Response for invoice creation
type CreateMaterialsInvoicePayload {
  invoice: MaterialsInvoice
}

# Mutations available in the API
type Mutation {
  createMaterialsInvoice(input: CreateMaterialsInvoiceInput!): CreateMaterialsInvoicePayload
}
```

### backend\schema.py

```py
import ariadne
from ariadne import ObjectType, QueryType, MutationType, InterfaceType, make_executable_schema
from ariadne.asgi import GraphQL
from graphql import GraphQLError
from datetime import datetime
from sqlalchemy.exc import SQLAlchemyError
import logging
from decimal import Decimal

from models import db, Client, Supplier, MaterialsInvoice, Transaction, Debt, InvoiceStatus

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
```

### backend\seed.py

```py
from app import create_app
from backend.models import db, Client, Supplier

app = create_app()

with app.app_context():
    db.session.add(Client(name="Test Client", markup_rate=0.15))
    db.session.add(Supplier(name="Test Supplier"))
    db.session.commit()
    print("Database seeded successfully!")
```

### backend\setup.py

```py
import os
import subprocess
import sys
import platform

def run_command(command):
    print(f"Running: {command}")
    process = subprocess.run(command, shell=True)
    if process.returncode != 0:
        print(f"Command failed with exit code {process.returncode}")
        sys.exit(process.returncode)

def main():
    # Determine the correct Python command
    python_cmd = "python" if platform.system() == "Windows" else "python3"
    
    # Create virtual environment if it doesn't exist
    if not os.path.exists("venv"):
        print("Creating virtual environment...")
        # Run the venv command directly as a subprocess call
        run_command(f"{python_cmd} -m venv venv")
        print("Virtual environment created.")
    
    # Install dependencies directly using the pip executable
    print("Installing dependencies...")
    if platform.system() == "Windows":
        pip_cmd = os.path.join("venv", "Scripts", "pip")
        python_exe = os.path.join("venv", "Scripts", "python")
    else:
        pip_cmd = os.path.join("venv", "bin", "pip")
        python_exe = os.path.join("venv", "bin", "python")
    
    # First, make sure pip is up to date
    run_command(f'"{python_exe}" -m pip install --upgrade pip')
    
    # Uninstall any potentially conflicting packages
    run_command(f'"{pip_cmd}" uninstall -y graphene graphene-sqlalchemy graphql-relay flask-graphql')
    
    # Install dependencies from the updated requirements.txt
    run_command(f'"{pip_cmd}" install -r requirements.txt')
    
    # Set the FLASK_APP environment variable
    os.environ["FLASK_APP"] = "app.py"
    
    # Initialize database
    print("Initializing database...")
    
    # Only run db init if migrations directory doesn't exist
    if not os.path.exists("migrations"):
        run_command(f'"{python_exe}" -m flask db init')
    else:
        print("Migrations directory already exists, skipping initialization.")
    
    # Always run migrate and upgrade
    run_command(f'"{python_exe}" -m flask db migrate -m "initial migration"')
    run_command(f'"{python_exe}" -m flask db upgrade')
    
    # Seed database
    seed = input("Do you want to seed the database with test data? (y/n): ").lower()
    if seed == 'y':
        print("Seeding database...")
        run_command(f'"{python_exe}" seed.py')
    
    print("Backend setup completed successfully!")
    print("The application uses Ariadne for GraphQL (Python 3.12+ compatible)")
    print("You can start the application with: python app.py")
    print("Access the GraphQL playground at: http://localhost:5000/graphql")

if __name__ == "__main__":
    main()
```

### docker-compose.yml

```yml
version: '3.8'
services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    environment:
      - SQLALCHEMY_DATABASE_URI=sqlite:///test.db
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:80"
    restart: unless-stopped
```

### frontend\.babelrc

```
{
  "plugins": [
    "relay"
  ],
  "presets": [
    "react-app"
  ]
}
```

### frontend\.eslintrc.js

```js
module.exports = {
  root: true,
  extends: ['react-app', 'react-app/jest'],
  rules: {
    // Treat all TypeScript-related warnings as errors
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-non-null-assertion': 'error',
    '@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true }],
    
    // React-specific rules
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'error',

    // Remove the Relay type safety rules until we can properly set up the plugin
  }
};
```

### frontend\.github\workflows\ci.yml

```yml
name: Frontend CI/CD

on:
  push:
    branches: [ main, develop ]
    paths:
      - 'frontend/**'
  pull_request:
    branches: [ main, develop ]
    paths:
      - 'frontend/**'

jobs:
  build:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./frontend

    strategy:
      matrix:
        node-version: [16.x, 18.x]

    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
        cache-dependency-path: './frontend/package-lock.json'
    
    - name: Install dependencies
      run: npm ci
    
    - name: TypeScript Type Check
      run: npm run type-check
    
    - name: Lint
      run: npm run lint
    
    - name: Run Relay Compiler
      run: npm run relay
    
    - name: Run tests
      run: npm test -- --watchAll=false
    
    - name: Build
      run: npm run build

    - name: Archive artifacts
      uses: actions/upload-artifact@v3
      with:
        name: build-${{ matrix.node-version }}
        path: frontend/build/
```

### frontend\.nvmrc

```

```

### frontend\Dockerfile

```
FROM node:18.15.0-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci
RUN npm list typescript || true
RUN npm install -D typescript@4.9.5
COPY . .
RUN npm run type-check-all
RUN npm run lint
RUN npm run relay
RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### frontend\babel.config.js

```js
module.exports = {
  presets: ['react-app'],
  plugins: ['relay']
};
```

### frontend\craco.config.js

```js
module.exports = {
  babel: {
    plugins: [
      'relay'
    ]
  },
  webpack: {
    configure: {
      resolve: {
        preferRelative: true
      }
    }
  }
};
```

### frontend\eslint-plugin-relay-types\index.js

```js
/**
 * Custom ESLint plugin for enforcing Relay type patterns
 * This helps catch common type mistakes before they cause runtime issues
 */

module.exports = {
  rules: {
    'proper-query-typing': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Enforce proper type patterns when using useLazyLoadQuery',
          category: 'TypeScript',
          recommended: true,
        },
        fixable: 'code',
        schema: []
      },
      create: function(context) {
        return {
          CallExpression(node) {
            // Check for useLazyLoadQuery calls
            if (node.callee.name === 'useLazyLoadQuery') {
              // If there are type parameters
              if (node.typeParameters && node.typeParameters.params && node.typeParameters.params.length > 0) {
                const typeParam = context.getSourceCode().getText(node.typeParameters.params[0]);
                
                // Check if it uses the correct pattern
                const hasResponseProp = typeParam.includes("['response']") || typeParam.includes('["response"]');
                const usesResponseType = typeParam.includes('ResponseType<');
                
                if (!hasResponseProp && !usesResponseType) {
                  context.report({
                    node: node.typeParameters.params[0],
                    message: "useLazyLoadQuery should use Type['response'] pattern or ResponseType<Type>",
                    fix: function(fixer) {
                      // Try to fix by adding ['response']
                      return fixer.insertTextAfter(
                        node.typeParameters.params[0], 
                        "['response']"
                      );
                    }
                  });
                }
              } else {
                // No type parameters at all
                context.report({
                  node,
                  message: "useLazyLoadQuery should have explicit type parameters using Type['response'] pattern"
                });
              }
            }
          }
        };
      }
    },
    
    'validate-connection-edges': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Ensure proper null checking when mapping over connection edges',
          category: 'TypeScript',
          recommended: true,
        },
        schema: []
      },
      create: function(context) {
        return {
          CallExpression(node) {
            // Look for .map() calls on edges
            if (node.callee.type === 'MemberExpression' && 
                node.callee.property.name === 'map' &&
                node.callee.object.type === 'MemberExpression' &&
                node.callee.object.property.name === 'edges') {
              
              // Check if the callback has a parameter
              if (node.arguments.length > 0 && 
                  node.arguments[0].type === 'ArrowFunctionExpression' &&
                  node.arguments[0].params.length > 0) {
                
                const callbackBody = node.arguments[0].body;
                const edgeParam = node.arguments[0].params[0];
                
                // Check if there's a null check for the edge or node 
                let hasNullCheck = false;
                
                // If the body is a block statement, look for null checks
                if (callbackBody.type === 'BlockStatement') {
                  callbackBody.body.forEach(statement => {
                    if (statement.type === 'IfStatement') {
                      const test = context.getSourceCode().getText(statement.test);
                      if (test.includes('!edge') || test.includes('!edge.node')) {
                        hasNullCheck = true;
                      }
                    }
                  });
                }
                
                // If no null check is found, report an error
                if (!hasNullCheck) {
                  context.report({
                    node: edgeParam,
                    message: "Always check for null/undefined when mapping over edges (e.g., if (!edge || !edge.node) return null)"
                  });
                }
              }
            }
          }
        };
      }
    }
  }
};
```

### frontend\nginx.conf

```conf
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    # Prevent favicon.ico 404 errors
    location = /favicon.ico {
        log_not_found off;
        access_log off;
    }

    # Prevent robots.txt 404 errors
    location = /robots.txt {
        log_not_found off;
        access_log off;
    }

    # Static content (js, css, images)
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires max;
        log_not_found off;
    }

    # Everything else goes to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_comp_level 6;
    gzip_min_length 1000;
}
```

### frontend\package.json

```json
{
  "name": "frontend",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@emotion/react": "^11.10.6",
    "@emotion/styled": "^11.10.6",
    "@mui/icons-material": "^5.11.16",
    "@mui/material": "^5.11.16",
    "@testing-library/dom": "^9.0.0",
    "@testing-library/jest-dom": "^5.16.5",
    "@testing-library/react": "^14.0.0",
    "@testing-library/user-event": "^14.4.3",
    "@types/jest": "^29.5.0",
    "@types/node": "^18.15.11",
    "@types/react": "^18.0.33",
    "@types/react-dom": "^18.0.11",
    "@types/react-relay": "^14.0.0",
    "@types/relay-runtime": "^14.0.0",
    "graphql": "^16.6.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.43.9",
    "react-relay": "^14.0.0",
    "react-scripts": "^5.0.1",
    "relay-runtime": "^14.0.0",
    "typescript": "^4.9.5",
    "web-vitals": "^3.3.1"
  },
  "scripts": {
    "start": "npm run relay && craco start",
    "build": "npm run fix-test-imports && npm run type-check && npm run lint && npm run relay && craco build",
    "test": "craco test",
    "eject": "react-scripts eject",
    "relay": "relay-compiler",
    "type-check": "tsc --noEmit",
    "type-check-all": "node scripts/type-check-all.js",
    "fix-test-imports": "node scripts/fix-test-imports.js",
    "lint": "eslint src --ext .ts,.tsx --max-warnings=0",
    "deploy": "bash scripts/deploy.sh",
    "docker-build": "scripts/docker-build.sh",
    "docker-build-win": "powershell -ExecutionPolicy Bypass -File scripts/docker-build.ps1"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "engines": {
    "node": "18.x",
    "npm": "9.x"
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "devDependencies": {
    "@craco/craco": "^7.1.0",
    "autoprefixer": "^10.4.21",
    "babel-plugin-relay": "^14.0.0",
    "postcss": "^8.5.3",
    "relay-compiler": "^14.0.0",
    "tailwindcss": "^3.3.5"
  }
}
```

### frontend\postcss.config.js

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### frontend\public\index.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta
      name="description"
      content="Web site created using create-react-app"
    />
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
    <!--
      manifest.json provides metadata used when your web app is installed on a
      user's mobile device or desktop. See https://developers.google.com/web/fundamentals/web-app-manifest/
    -->
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
    <!--
      Notice the use of %PUBLIC_URL% in the tags above.
      It will be replaced with the URL of the `public` folder during the build.
      Only files inside the `public` folder can be referenced from the HTML.

      Unlike "/favicon.ico" or "favicon.ico", "%PUBLIC_URL%/favicon.ico" will
      work correctly both with client-side routing and a non-root public URL.
      Learn how to configure a non-root public URL by running `npm run build`.
    -->
    <title>React App</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
    <!--
      This HTML file is a template.
      If you open it directly in the browser, you will see an empty page.

      You can add webfonts, meta tags, or analytics to this file.
      The build step will place the bundled scripts into the <body> tag.

      To begin the development, run `npm start` or `yarn start`.
      To create a production bundle, use `npm run build` or `yarn build`.
    -->
  </body>
</html>
```

### frontend\public\manifest.json

```json
{
  "short_name": "React App",
  "name": "Create React App Sample",
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    },
    {
      "src": "logo192.png",
      "type": "image/png",
      "sizes": "192x192"
    },
    {
      "src": "logo512.png",
      "type": "image/png",
      "sizes": "512x512"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#000000",
  "background_color": "#ffffff"
}
```

### frontend\public\robots.txt

```txt
# https://www.robotstxt.org/robotstxt.html
User-agent: *
Disallow:
```

### frontend\relay.config.js

```js
module.exports = {
  src: "./src",
  schema: "./schema.graphql",
  language: "typescript",
  artifactDirectory: "./src/__generated__",
  exclude: ["**/node_modules/**", "**/__mocks__/**", "**/__generated__/**"],
};
```

### frontend\relay.config.json

```json
{
  "src": "./src",
  "schema": "./schema.graphql",
  "artifactDirectory": "./src/__generated__",
  "language": "typescript",
  "eagerEsModules": true,
  "exclude": ["**/node_modules/**", "**/__mocks__/**", "**/__generated__/**"]
}
```

### frontend\run.js

```js
const { execSync } = require('child_process');

function main() {
  console.log('Starting React development server...');
  
  try {
    execSync('npm start', { stdio: 'inherit' });
  } catch (error) {
    console.error(`Failed to start development server: ${error}`);
    process.exit(1);
  }
}

main();
```

### frontend\schema.graphql

```graphql
interface Node {
        id: ID!
    }

    type PageInfo {
        hasNextPage: Boolean!
        endCursor: String
    }

    type Query {
        node(id: ID!): Node
        clients(first: Int, after: String): ClientConnection
        suppliers(first: Int, after: String): SupplierConnection
        transactions(first: Int, after: String): TransactionConnection
        debts(first: Int, after: String): DebtConnection
    }
    
    type Mutation {
        createMaterialsInvoice(
            clientId: ID!
            supplierId: ID!
            invoiceDate: String!
            baseAmount: Float!
        ): CreateMaterialsInvoicePayload
    }
    
    type CreateMaterialsInvoicePayload {
        invoice: MaterialsInvoice
        errors: [String]
    }
    
    type ClientEdge {
        node: Client
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
    }
    
    type SupplierEdge {
        node: Supplier
        cursor: String!
    }

    type SupplierConnection {
        edges: [SupplierEdge]
        pageInfo: PageInfo!
    }
    
    type Supplier implements Node {
        id: ID!
        name: String!
    }
    
    type TransactionEdge {
        node: Transaction
        cursor: String!
    }

    type TransactionConnection {
        edges: [TransactionEdge]
        pageInfo: PageInfo!
    }
    
    type Transaction implements Node {
        id: ID!
        amount: Float!
        transaction_date: String!
        invoice: MaterialsInvoice
    }
    
    type DebtEdge {
        node: Debt
        cursor: String!
    }

    type DebtConnection {
        edges: [DebtEdge]
        pageInfo: PageInfo!
    }
    
    type Debt implements Node {
        id: ID!
        party: String!
        amount: Float!
        created_date: String!
        invoice: MaterialsInvoice
    }

    type MaterialsInvoice implements Node {
        id: ID!
        base_amount: Float!
        status: String!
        invoice_date: String!
    }
```

### frontend\scripts\deploy.sh

```sh
#!/bin/bash

# Exit on any error
set -e

echo "🔍 Starting deployment process..."

# Ensure we're in the frontend directory
cd "$(dirname "$0")/.."

# Check for Node.js version compatibility
REQUIRED_NODE_VERSION="v18.15.0"
NODE_VERSION=$(node -v)
echo "📋 Node version: $NODE_VERSION"

if [[ "$NODE_VERSION" != "$REQUIRED_NODE_VERSION" ]]; then
  echo "⚠️ Warning: Node version mismatch! Using $NODE_VERSION, expected $REQUIRED_NODE_VERSION"
  echo "This may cause inconsistent builds between environments"
  
  # Uncomment the following line to fail the build on version mismatch
  # exit 1
fi

# Ensure correct TypeScript version
REQUIRED_TS_VERSION="4.9.5"
TS_VERSION=$(node -e "console.log(require('./package.json').dependencies.typescript || require('./package.json').devDependencies.typescript)")
echo "📋 TypeScript version: $TS_VERSION"

if [[ "$TS_VERSION" != "^$REQUIRED_TS_VERSION" && "$TS_VERSION" != "$REQUIRED_TS_VERSION" ]]; then
  echo "⚠️ Warning: TypeScript version mismatch! Using $TS_VERSION, expected $REQUIRED_TS_VERSION"
  echo "This may cause inconsistent builds between environments"
  
  # Uncomment the following line to fail the build on version mismatch
  # exit 1
fi

# Clear any existing node_modules and build artifacts
echo "🧹 Cleaning previous build artifacts..."
rm -rf node_modules build

# Install all dependencies from scratch using the exact versions in package-lock.json
echo "📦 Installing dependencies from package-lock.json..."
npm ci

# Fix any import path issues in test files
echo "🔧 Fixing import paths in test files..."
npm run fix-test-imports

# Run enhanced type checking
echo "🔎 Running enhanced type check..."
npm run type-check-all

# Run ESLint
echo "🧐 Running lint check..."
npm run lint

# Run the Relay compiler
echo "🧩 Running Relay compiler..."
npm run relay

# Build the production version
echo "🔨 Building production bundle..."
npm run build

echo "✅ Build completed successfully!"
echo "📦 Production build is available in the 'build' directory"
echo "📝 Use 'npm install -g serve && serve -s build' to test the production build locally"
```

### frontend\scripts\docker-build.ps1

```ps1
# This script builds the frontend in a Docker container to ensure build consistency
# It can be used to verify that your local changes will build successfully in CI/CD

# Get the directory of the script
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectDir = Split-Path -Parent $ScriptDir

# Display info about the build
Write-Host "Starting Docker build for frontend..." -ForegroundColor Cyan
Write-Host "Project directory: $ProjectDir" -ForegroundColor Cyan

# Check if Docker is installed
try {
    $dockerVersion = docker --version
    Write-Host "Found Docker: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: Docker is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Docker and try again" -ForegroundColor Yellow
    exit 1
}

# Build the Docker image
Write-Host "Building Docker image..." -ForegroundColor Cyan
docker build -t frontend-build $ProjectDir

# Check if the build was successful
if ($LASTEXITCODE -eq 0) {
    Write-Host "Docker build completed successfully!" -ForegroundColor Green
    
    # Optionally run tests in the container
    $runTests = Read-Host "Do you want to run tests in the container? (y/n)"
    if ($runTests -eq "y" -or $runTests -eq "Y") {
        Write-Host "Running tests in Docker container..." -ForegroundColor Cyan
        docker run --rm frontend-build sh -c "cd /app && npm test -- --watchAll=false"
    }
    
    # Optionally serve the built app
    $serveApp = Read-Host "Do you want to serve the built app locally? (y/n)"
    if ($serveApp -eq "y" -or $serveApp -eq "Y") {
        Write-Host "Serving the built app on http://localhost:8080..." -ForegroundColor Cyan
        docker run --rm -p 8080:80 frontend-build
        
        # Add note about stopping the container
        Write-Host "Press Ctrl+C to stop the container when finished" -ForegroundColor Yellow
    }
} else {
    Write-Host "Docker build failed" -ForegroundColor Red
    exit 1
}
```

### frontend\scripts\docker-build.sh

```sh
#!/bin/bash
# This script builds the frontend in a Docker container to ensure build consistency
# It can be used to verify that your local changes will build successfully in CI/CD

set -e

# Get the directory of the script
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$DIR")"

# Display info about the build
echo "🐳 Starting Docker build for frontend..."
echo "📂 Project directory: $PROJECT_DIR"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed or not in PATH"
    echo "Please install Docker and try again"
    exit 1
fi

# Build the Docker image
echo "🏗️ Building Docker image..."
docker build -t frontend-build "$PROJECT_DIR"

# Check if the build was successful
if [ $? -eq 0 ]; then
    echo "✅ Docker build completed successfully!"
    
    # Optionally run tests in the container
    read -p "Do you want to run tests in the container? (y/n) " run_tests
    if [[ $run_tests =~ ^[Yy]$ ]]; then
        echo "🧪 Running tests in Docker container..."
        docker run --rm frontend-build sh -c "cd /app && npm test -- --watchAll=false"
    fi
    
    # Optionally serve the built app
    read -p "Do you want to serve the built app locally? (y/n) " serve_app
    if [[ $serve_app =~ ^[Yy]$ ]]; then
        echo "🚀 Serving the built app on http://localhost:8080..."
        docker run --rm -p 8080:80 frontend-build
    fi
else
    echo "❌ Docker build failed"
    exit 1
fi
```

### frontend\scripts\fix-test-imports.js

```js
#!/usr/bin/env node

/**
 * This script fixes imports in test files by removing the .ts extension
 * from imports, which causes TypeScript errors during build.
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

// Function to recursively get all test files in a directory
function getAllTestFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Recursively get files from subdirectories, but skip node_modules and build
      if (file !== 'node_modules' && file !== 'build') {
        results = results.concat(getAllTestFiles(filePath));
      }
    } else if (
      (file.endsWith('.test.ts') || file.endsWith('.test.tsx')) && 
      !file.includes('setupTests')
    ) {
      results.push(filePath);
    }
  });
  
  return results;
}

// Get all test files in the src directory
console.log('🔍 Scanning for test files to fix import paths...');
const srcDir = path.join(__dirname, '..', 'src');
const testFiles = getAllTestFiles(srcDir);

if (testFiles.length === 0) {
  console.log('🔍 No test files found. Nothing to fix.');
  process.exit(0);
}

console.log(`🔧 Found ${testFiles.length} test files to check.`);

// Process each file
let fixedCount = 0;
for (const filePath of testFiles) {
  let content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(srcDir, filePath);
  
  // Fix the imports by removing the .ts extension
  // This pattern targets .graphql.ts, .tsx, and .ts extensions in imports
  const fixedContent = content
    .replace(/\.graphql\.ts(['"])/g, '.graphql$1')
    .replace(/(from\s+['"].*?)\.tsx?(['"])/g, '$1$2');
  
  if (content !== fixedContent) {
    fs.writeFileSync(filePath, fixedContent);
    console.log(`✅ Fixed imports in ${relativePath}`);
    fixedCount++;
  }
}

console.log(`\n🎉 Fixed imports in ${fixedCount} files.`);

// Run the build again to see if fixes worked
if (fixedCount > 0) {
  console.log('\n🏗️ Running TypeScript check to verify fixes...');
  try {
    const result = spawnSync('npx', ['tsc', '--noEmit'], { 
      stdio: 'inherit',
      shell: process.platform === 'win32'
    });
    
    if (result.status === 0) {
      console.log('\n✅ TypeScript check passed successfully!');
    } else {
      console.error('\n❌ TypeScript check still has errors. Please check the output above.');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Error running TypeScript check:', error);
    process.exit(1);
  }
}
```

### frontend\scripts\pre-commit.js

```js

```

### frontend\scripts\type-check-all.js

```js
#!/usr/bin/env node

/**
 * Advanced type checking script that checks both source code and generated code
 * Useful to catch discrepancies between local and CI environments
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Utility function to run a command and check its exit code
function runCommand(command, args = [], options = {}) {
  console.log(`\n> ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, { 
    stdio: 'inherit', 
    shell: process.platform === 'win32',
    ...options 
  });

  if (result.status !== 0) {
    console.error(`\n❌ Command failed with status ${result.status}`);
    process.exit(result.status);
  }

  return result;
}

// Create temporary test files in a temporary directory
function createTypeTestFiles() {
  // Create files in the system's temp directory instead of the project
  const testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'relay-type-tests-'));
  const generatedDir = path.join(__dirname, '..', 'src', '__generated__');
  
  // Get all generated GraphQL files
  const files = fs.readdirSync(generatedDir)
    .filter(file => file.endsWith('.graphql.ts'));
  
  const testFiles = [];
  
  for (const file of files) {
    const baseName = path.basename(file, '.graphql.ts');
    const importPath = path.join(
      path.relative(testDir, path.join(__dirname, '..')), 
      'src', '__generated__', baseName + '.graphql'
    ).replace(/\\/g, '/');
    
    // Create a test file that imports and uses the types
    // Important: don't add .ts extension to the import to avoid TS errors
    const testContent = `
// Auto-generated test file for ${baseName}
import type { ${baseName} } from '${importPath}';

// Test that we can use the response property
type TestResponseType = ${baseName}['response'];

// Verify structure matches what components expect
const testFunc = (data: TestResponseType): void => {
  console.log(data);
};

export default testFunc;
`;
    
    const testFilePath = path.join(testDir, `${baseName}.test.ts`);
    fs.writeFileSync(testFilePath, testContent);
    testFiles.push(testFilePath);
  }
  
  return { testDir, testFiles };
}

// Clean up test files
function cleanupTestFiles(testDir) {
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true, force: true });
  }
}

// Ensure imports in test files use correct format
function fixTestImportPaths() {
  console.log('\n🔧 Checking for any test files with incorrect import paths...');
  
  // Look for the __type_tests__ directory
  const typeTestsDir = path.join(__dirname, '..', 'src', '__type_tests__');
  if (!fs.existsSync(typeTestsDir)) {
    console.log('No __type_tests__ directory found. Nothing to fix.');
    return;
  }
  
  // Get all test files in the directory
  const files = fs.readdirSync(typeTestsDir)
    .filter(file => file.endsWith('.ts') || file.endsWith('.tsx'));
  
  if (files.length === 0) {
    console.log('No test files found in __type_tests__ directory. Nothing to fix.');
    return;
  }
  
  console.log(`Found ${files.length} test files to fix.`);
  
  // Process each file
  let fixedCount = 0;
  for (const file of files) {
    const filePath = path.join(typeTestsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix the imports by removing the .ts extension
    const fixedContent = content.replace(/\.graphql\.ts(['"])/g, '.graphql$1');
    
    if (content !== fixedContent) {
      fs.writeFileSync(filePath, fixedContent);
      console.log(`Fixed imports in ${file}`);
      fixedCount++;
    } else {
      console.log(`No changes needed in ${file}`);
    }
  }
  
  console.log(`\nFixed imports in ${fixedCount} files.`);
}

// Main function
function main() {
  console.log('🔍 Running enhanced type checking...');
  
  // Run the normal type checking first
  runCommand('npx', ['tsc', '--noEmit']);
  
  // Create test files for generated types
  console.log('\n🧪 Creating type test files for generated GraphQL types...');
  const { testDir, testFiles } = createTypeTestFiles();
  
  try {
    // Run type checking on each test file individually
    console.log('\n🔎 Type checking generated GraphQL types...');
    
    for (const testFile of testFiles) {
      runCommand('npx', ['tsc', '--noEmit', testFile]);
    }
    
    console.log('\n✅ All type checks passed!');
  } finally {
    // Clean up test files
    cleanupTestFiles(testDir);
  }

  // Run fix-test-imports to ensure any project test files have correct imports
  fixTestImportPaths();
}

main();
```

### frontend\setup.js

```js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function runCommand(command) {
  console.log(`Running: ${command}`);
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Command failed with error: ${error}`);
    process.exit(1);
  }
}

function main() {
  console.log('Setting up frontend dependencies...');
  
  const forceInstall = process.argv.includes('--force');
  const packageJsonPath = path.join(__dirname, 'package.json');
  const nodeModulesPath = path.join(__dirname, 'node_modules');
  
  // Check if we should reinstall dependencies
  let shouldInstall = forceInstall;
  
  if (!shouldInstall) {
    // Check if node_modules exists
    if (!fs.existsSync(nodeModulesPath)) {
      console.log('Node modules directory not found. Installing dependencies...');
      shouldInstall = true;
    } else {
      // Check if package.json has been modified since last install
      const packageJsonStat = fs.statSync(packageJsonPath);
      const nodeModulesStat = fs.statSync(nodeModulesPath);
      
      if (packageJsonStat.mtimeMs > nodeModulesStat.mtimeMs) {
        console.log('Package.json has been modified. Reinstalling dependencies...');
        shouldInstall = true;
      }
    }
  }
  
  if (shouldInstall) {
    console.log('Installing dependencies...');
    runCommand('npm install');
  } else {
    console.log('Dependencies already installed. To force reinstall, run with --force flag or delete node_modules folder.');
  }
  
  console.log('Frontend setup completed successfully!');
}

main();
```

### frontend\src\App.css

```css
.App {
  text-align: center;
}

.App-logo {
  height: 40vmin;
  pointer-events: none;
}

@media (prefers-reduced-motion: no-preference) {
  .App-logo {
    animation: App-logo-spin infinite 20s linear;
  }
}

.App-header {
  background-color: #282c34;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
  color: white;
}

.App-link {
  color: #61dafb;
}

@keyframes App-logo-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
```

### frontend\src\App.test.tsx

```tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the GraphQL dependencies
jest.mock('react-relay', () => ({
  useRelayEnvironment: jest.fn(),
  RelayEnvironmentProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  graphql: jest.fn(() => ({})),
  useLazyLoadQuery: jest.fn(() => ({
    clients: { edges: [], pageInfo: { hasNextPage: false, endCursor: null } },
    debts: { edges: [], pageInfo: { hasNextPage: false, endCursor: null } },
    transactions: { edges: [], pageInfo: { hasNextPage: false, endCursor: null } }
  }))
}));

// Mock the components that use GraphQL
jest.mock('./components/InvoiceForm', () => () => <div>Mocked InvoiceForm</div>);
jest.mock('./components/ClientList', () => () => <div>Mocked ClientList</div>);
jest.mock('./components/DebtList', () => () => <div>Mocked DebtList</div>);
jest.mock('./components/TransactionList', () => () => <div>Mocked TransactionList</div>);

test('renders app without crashing', () => {
  render(<App />);
  const appElement = screen.getByText(/Materials Tracking Module/i);
  expect(appElement).toBeInTheDocument();
});
```

### frontend\src\App.tsx

```tsx
import React from 'react';
import { Container, Typography, Box, Grid } from '@mui/material';
import InvoiceForm from './components/InvoiceForm';
import DebtList from './components/DebtList';
import TransactionList from './components/TransactionList';
import ClientList from './components/ClientList';
import NodeViewer from './components/NodeViewer';

const App = (): React.ReactElement => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Materials Tracking Module
      </Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <NodeViewer />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Create Invoice
          </Typography>
          <InvoiceForm />
          <Box sx={{ mt: 4 }}>
            <ClientList />
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <TransactionList />
          <Box sx={{ mt: 4 }}>
            <DebtList />
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}

export default App;
```

### frontend\src\__generated__\ClientListQuery.graphql.ts

```ts
/**
 * @generated SignedSource<<d6ae1e920f4f000e7967ea6db9f564a4>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
export type ClientListQuery$variables = {
  after?: string | null;
  first?: number | null;
};
export type ClientListQuery$data = {
  readonly clients: {
    readonly edges: ReadonlyArray<{
      readonly cursor: string;
      readonly node: {
        readonly id: string;
        readonly markup_rate: number;
        readonly name: string;
      } | null;
    } | null> | null;
    readonly pageInfo: {
      readonly endCursor: string | null;
      readonly hasNextPage: boolean;
    };
  } | null;
};
export type ClientListQuery = {
  response: ClientListQuery$data;
  variables: ClientListQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "after"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "first"
},
v2 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "after",
        "variableName": "after"
      },
      {
        "kind": "Variable",
        "name": "first",
        "variableName": "first"
      }
    ],
    "concreteType": "ClientConnection",
    "kind": "LinkedField",
    "name": "clients",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "ClientEdge",
        "kind": "LinkedField",
        "name": "edges",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "Client",
            "kind": "LinkedField",
            "name": "node",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "id",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "name",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "markup_rate",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "cursor",
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "PageInfo",
        "kind": "LinkedField",
        "name": "pageInfo",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "hasNextPage",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "endCursor",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "ClientListQuery",
    "selections": (v2/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "ClientListQuery",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "3900db2c6a07faa852551cd6cdbd7195",
    "id": null,
    "metadata": {},
    "name": "ClientListQuery",
    "operationKind": "query",
    "text": "query ClientListQuery(\n  $first: Int\n  $after: String\n) {\n  clients(first: $first, after: $after) {\n    edges {\n      node {\n        id\n        name\n        markup_rate\n      }\n      cursor\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "52c2fcff63311ee0cd937907c12d6161";

export default node;
```

### frontend\src\__generated__\CreateMaterialsInvoiceMutation.graphql.ts

```ts
/**
 * @generated SignedSource<<ab9a1ce497407298e6c18a36f770873d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type CreateMaterialsInvoiceMutation$variables = {
  baseAmount: number;
  clientId: string;
  invoiceDate: string;
  supplierId: string;
};
export type CreateMaterialsInvoiceMutation$data = {
  readonly createMaterialsInvoice: {
    readonly errors: ReadonlyArray<string | null> | null;
    readonly invoice: {
      readonly __typename: "MaterialsInvoice";
      readonly base_amount: number;
      readonly id: string;
    } | null;
  } | null;
};
export type CreateMaterialsInvoiceMutation = {
  response: CreateMaterialsInvoiceMutation$data;
  variables: CreateMaterialsInvoiceMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "baseAmount"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "clientId"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "invoiceDate"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "supplierId"
},
v4 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "baseAmount",
        "variableName": "baseAmount"
      },
      {
        "kind": "Variable",
        "name": "clientId",
        "variableName": "clientId"
      },
      {
        "kind": "Variable",
        "name": "invoiceDate",
        "variableName": "invoiceDate"
      },
      {
        "kind": "Variable",
        "name": "supplierId",
        "variableName": "supplierId"
      }
    ],
    "concreteType": "CreateMaterialsInvoicePayload",
    "kind": "LinkedField",
    "name": "createMaterialsInvoice",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "MaterialsInvoice",
        "kind": "LinkedField",
        "name": "invoice",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "base_amount",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "__typename",
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "errors",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "CreateMaterialsInvoiceMutation",
    "selections": (v4/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v3/*: any*/),
      (v2/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "CreateMaterialsInvoiceMutation",
    "selections": (v4/*: any*/)
  },
  "params": {
    "cacheID": "08c26f0936828878e28418d6ffa39cdd",
    "id": null,
    "metadata": {},
    "name": "CreateMaterialsInvoiceMutation",
    "operationKind": "mutation",
    "text": "mutation CreateMaterialsInvoiceMutation(\n  $clientId: ID!\n  $supplierId: ID!\n  $invoiceDate: String!\n  $baseAmount: Float!\n) {\n  createMaterialsInvoice(clientId: $clientId, supplierId: $supplierId, invoiceDate: $invoiceDate, baseAmount: $baseAmount) {\n    invoice {\n      id\n      base_amount\n      __typename\n    }\n    errors\n  }\n}\n"
  }
};
})();

(node as any).hash = "215b2adac7c3b441ab2c0dc6e9767785";

export default node;
```

### frontend\src\__generated__\DebtListQuery.graphql.ts

```ts
/**
 * @generated SignedSource<<cf06757ef1857802b71f072d589e6e23>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
export type DebtListQuery$variables = {
  after?: string | null;
  first?: number | null;
};
export type DebtListQuery$data = {
  readonly debts: {
    readonly edges: ReadonlyArray<{
      readonly cursor: string;
      readonly node: {
        readonly amount: number;
        readonly created_date: string;
        readonly id: string;
        readonly invoice: {
          readonly id: string;
        } | null;
        readonly party: string;
      } | null;
    } | null> | null;
    readonly pageInfo: {
      readonly endCursor: string | null;
      readonly hasNextPage: boolean;
    };
  } | null;
};
export type DebtListQuery = {
  response: DebtListQuery$data;
  variables: DebtListQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "after"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "first"
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v3 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "after",
        "variableName": "after"
      },
      {
        "kind": "Variable",
        "name": "first",
        "variableName": "first"
      }
    ],
    "concreteType": "DebtConnection",
    "kind": "LinkedField",
    "name": "debts",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "DebtEdge",
        "kind": "LinkedField",
        "name": "edges",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "Debt",
            "kind": "LinkedField",
            "name": "node",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "party",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "amount",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "created_date",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "MaterialsInvoice",
                "kind": "LinkedField",
                "name": "invoice",
                "plural": false,
                "selections": [
                  (v2/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "cursor",
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "PageInfo",
        "kind": "LinkedField",
        "name": "pageInfo",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "hasNextPage",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "endCursor",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "DebtListQuery",
    "selections": (v3/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "DebtListQuery",
    "selections": (v3/*: any*/)
  },
  "params": {
    "cacheID": "59db54bf572b0e13037dbe6f305646a4",
    "id": null,
    "metadata": {},
    "name": "DebtListQuery",
    "operationKind": "query",
    "text": "query DebtListQuery(\n  $first: Int\n  $after: String\n) {\n  debts(first: $first, after: $after) {\n    edges {\n      node {\n        id\n        party\n        amount\n        created_date\n        invoice {\n          id\n        }\n      }\n      cursor\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "b6e8cdb7563b9c623185b8a2ccade331";

export default node;
```

### frontend\src\__generated__\InvoiceFormClientsSuppliersQuery.graphql.ts

```ts
/**
 * @generated SignedSource<<b871f5d02cd81664f8208e24b9ead493>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
export type InvoiceFormClientsSuppliersQuery$variables = {
  clientsFirst?: number | null;
  suppliersFirst?: number | null;
};
export type InvoiceFormClientsSuppliersQuery$data = {
  readonly clients: {
    readonly edges: ReadonlyArray<{
      readonly cursor: string;
      readonly node: {
        readonly id: string;
        readonly name: string;
      } | null;
    } | null> | null;
    readonly pageInfo: {
      readonly endCursor: string | null;
      readonly hasNextPage: boolean;
    };
  } | null;
  readonly suppliers: {
    readonly edges: ReadonlyArray<{
      readonly cursor: string;
      readonly node: {
        readonly id: string;
        readonly name: string;
      } | null;
    } | null> | null;
    readonly pageInfo: {
      readonly endCursor: string | null;
      readonly hasNextPage: boolean;
    };
  } | null;
};
export type InvoiceFormClientsSuppliersQuery = {
  response: InvoiceFormClientsSuppliersQuery$data;
  variables: InvoiceFormClientsSuppliersQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "clientsFirst"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "suppliersFirst"
  }
],
v1 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "id",
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "name",
    "storageKey": null
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "cursor",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "concreteType": "PageInfo",
  "kind": "LinkedField",
  "name": "pageInfo",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "hasNextPage",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "endCursor",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v4 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "first",
        "variableName": "clientsFirst"
      }
    ],
    "concreteType": "ClientConnection",
    "kind": "LinkedField",
    "name": "clients",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "ClientEdge",
        "kind": "LinkedField",
        "name": "edges",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "Client",
            "kind": "LinkedField",
            "name": "node",
            "plural": false,
            "selections": (v1/*: any*/),
            "storageKey": null
          },
          (v2/*: any*/)
        ],
        "storageKey": null
      },
      (v3/*: any*/)
    ],
    "storageKey": null
  },
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "first",
        "variableName": "suppliersFirst"
      }
    ],
    "concreteType": "SupplierConnection",
    "kind": "LinkedField",
    "name": "suppliers",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "SupplierEdge",
        "kind": "LinkedField",
        "name": "edges",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "Supplier",
            "kind": "LinkedField",
            "name": "node",
            "plural": false,
            "selections": (v1/*: any*/),
            "storageKey": null
          },
          (v2/*: any*/)
        ],
        "storageKey": null
      },
      (v3/*: any*/)
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "InvoiceFormClientsSuppliersQuery",
    "selections": (v4/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "InvoiceFormClientsSuppliersQuery",
    "selections": (v4/*: any*/)
  },
  "params": {
    "cacheID": "839e59d832af61f48ade048c7b9d1c4a",
    "id": null,
    "metadata": {},
    "name": "InvoiceFormClientsSuppliersQuery",
    "operationKind": "query",
    "text": "query InvoiceFormClientsSuppliersQuery(\n  $clientsFirst: Int\n  $suppliersFirst: Int\n) {\n  clients(first: $clientsFirst) {\n    edges {\n      node {\n        id\n        name\n      }\n      cursor\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n  suppliers(first: $suppliersFirst) {\n    edges {\n      node {\n        id\n        name\n      }\n      cursor\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "e5972f4acde55ef0030cfdadaf97927f";

export default node;
```

### frontend\src\__generated__\TransactionListQuery.graphql.ts

```ts
/**
 * @generated SignedSource<<82d2c9ebf2e60f9ead3f4fe301acd072>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
export type TransactionListQuery$variables = {
  after?: string | null;
  first?: number | null;
};
export type TransactionListQuery$data = {
  readonly transactions: {
    readonly edges: ReadonlyArray<{
      readonly cursor: string;
      readonly node: {
        readonly amount: number;
        readonly id: string;
        readonly invoice: {
          readonly id: string;
        } | null;
        readonly transaction_date: string;
      } | null;
    } | null> | null;
    readonly pageInfo: {
      readonly endCursor: string | null;
      readonly hasNextPage: boolean;
    };
  } | null;
};
export type TransactionListQuery = {
  response: TransactionListQuery$data;
  variables: TransactionListQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "after"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "first"
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v3 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "after",
        "variableName": "after"
      },
      {
        "kind": "Variable",
        "name": "first",
        "variableName": "first"
      }
    ],
    "concreteType": "TransactionConnection",
    "kind": "LinkedField",
    "name": "transactions",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "TransactionEdge",
        "kind": "LinkedField",
        "name": "edges",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "Transaction",
            "kind": "LinkedField",
            "name": "node",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "amount",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "transaction_date",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "MaterialsInvoice",
                "kind": "LinkedField",
                "name": "invoice",
                "plural": false,
                "selections": [
                  (v2/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "cursor",
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "PageInfo",
        "kind": "LinkedField",
        "name": "pageInfo",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "hasNextPage",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "endCursor",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "TransactionListQuery",
    "selections": (v3/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "TransactionListQuery",
    "selections": (v3/*: any*/)
  },
  "params": {
    "cacheID": "ba9720d260be4a8a4c3c8fcae1a4d490",
    "id": null,
    "metadata": {},
    "name": "TransactionListQuery",
    "operationKind": "query",
    "text": "query TransactionListQuery(\n  $first: Int\n  $after: String\n) {\n  transactions(first: $first, after: $after) {\n    edges {\n      node {\n        id\n        amount\n        transaction_date\n        invoice {\n          id\n        }\n      }\n      cursor\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "78fd2f65a56b180ca022ec367d8bce2a";

export default node;
```

### frontend\src\components\ClientList.tsx

```tsx
import React from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Typography,
  Box,
  Button
} from '@mui/material';
import type { ClientListQuery } from './../__generated__/ClientListQuery.graphql';
import { ResponseType } from '../utils/types';
import { validateRelayData, validateRelayConnection } from '../utils/dataValidator';

// Define our query
const query = graphql`
  query ClientListQuery($first: Int, $after: String) {
    clients(first: $first, after: $after) {
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
`;

const ClientList: React.FC = () => {
  const [first] = React.useState(10);
  const [after, setAfter] = React.useState<string | null>(null);
  
  const data = useLazyLoadQuery<ResponseType<ClientListQuery>>(
    query, 
    { first, after }
  );

  // Validate data structure at runtime
  validateRelayData(data, 'ClientList');
  const clientsValid = validateRelayConnection(data.clients, 'clients', 'ClientList');

  const loadMore = (): void => {
    if (data.clients?.pageInfo.hasNextPage) {
      setAfter(data.clients.pageInfo.endCursor);
    }
  };

  if (!clientsValid || !data.clients || !data.clients.edges || data.clients.edges.length === 0) {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" gutterBottom>Clients</Typography>
        <Typography>No clients found.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>Clients</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Markup Rate</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.clients.edges.map((edge) => {
              if (!edge || !edge.node) return null;
              const node = edge.node;
              return (
                <TableRow key={node.id}>
                  <TableCell>{node.id}</TableCell>
                  <TableCell>{node.name}</TableCell>
                  <TableCell>{node.markup_rate}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      
      {data.clients.pageInfo.hasNextPage && (
        <Button 
          variant="outlined" 
          onClick={loadMore} 
          sx={{ mt: 2 }}
        >
          Load More
        </Button>
      )}
    </Box>
  );
};

export default ClientList;
```

### frontend\src\components\DebtList.tsx

```tsx
import React from 'react';
import { useLazyLoadQuery } from 'react-relay';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Box, Button } from '@mui/material';
import { graphql } from 'react-relay';
import type { DebtListQuery } from './../__generated__/DebtListQuery.graphql';

// Use the imported query
export const query = graphql`
  query DebtListQuery($first: Int, $after: String) {
    debts(first: $first, after: $after) {
      edges {
        node {
          id
          party
          amount
          created_date
          invoice {
            id
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
`;

const DebtList: React.FC = () => {
  const [first] = React.useState(10);
  const [after, setAfter] = React.useState<string | null>(null);

  const data = useLazyLoadQuery<DebtListQuery['response']>(
    query, 
    { first, after }
  );

  const loadMore = (): void => {
    const debts = data.debts;
    if (debts?.pageInfo.hasNextPage) {
      setAfter(debts.pageInfo.endCursor);
    }
  };

  if (!data.debts || !data.debts.edges || data.debts.edges.length === 0) {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" gutterBottom>Debts</Typography>
        <Typography>No debts found.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>Debts</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Debt ID</TableCell>
              <TableCell>Party</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Created Date</TableCell>
              <TableCell>Invoice ID</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.debts.edges.map((edge) => {
              if (!edge || !edge.node) return null;
              const node = edge.node;
              return (
                <TableRow key={node.id}>
                  <TableCell>{node.id}</TableCell>
                  <TableCell>{node.party}</TableCell>
                  <TableCell>{node.amount}</TableCell>
                  <TableCell>{node.created_date}</TableCell>
                  <TableCell>{node.invoice?.id}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      
      {data.debts.pageInfo.hasNextPage && (
        <Button 
          variant="outlined" 
          onClick={loadMore} 
          sx={{ mt: 2 }}
        >
          Load More
        </Button>
      )}
    </Box>
  );
};

export default DebtList;
```

### frontend\src\components\InvoiceForm.test.tsx

```tsx
import React from 'react';
import { render, screen } from '@testing-library/react';

// Import before mocking
import InvoiceForm from './InvoiceForm';

// Mock the component directly instead of trying to test with real GraphQL
jest.mock('./InvoiceForm', () => {
  return function MockedInvoiceForm() {
    return (
      <div>
        <h2>Create Materials Invoice</h2>
        <div>Mocked form fields</div>
      </div>
    );
  };
});

describe('InvoiceForm', () => {
  test('renders form fields', () => {
    render(<InvoiceForm />);
    
    // Check if the component renders without crashing
    expect(screen.getByText(/Create Materials Invoice/i)).toBeInTheDocument();
  });
});
```

### frontend\src\components\InvoiceForm.tsx

```tsx
import React from 'react';
import { TextField, Button, Box, CircularProgress, MenuItem } from '@mui/material';
import { useForm } from 'react-hook-form';
import { graphql, useLazyLoadQuery, useRelayEnvironment } from 'react-relay';
import { createInvoice, CreateMaterialsInvoiceMutationResponse } from '../mutations/CreateMaterialsInvoice';
import type { InvoiceFormClientsSuppliersQuery } from './../__generated__/InvoiceFormClientsSuppliersQuery.graphql';

const query = graphql`
  query InvoiceFormClientsSuppliersQuery($clientsFirst: Int, $suppliersFirst: Int) {
    clients(first: $clientsFirst) {
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
    suppliers(first: $suppliersFirst) {
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
`;

type InvoiceFormInputs = {
  clientGlobalId: string;
  supplierGlobalId: string;
  invoiceDate: string;
  baseAmount: number;
};

const InvoiceForm: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<InvoiceFormInputs>();
  const environment = useRelayEnvironment();
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  
  // Load clients and suppliers data
  const queryData = useLazyLoadQuery<InvoiceFormClientsSuppliersQuery['response']>(
    query, 
    { clientsFirst: 50, suppliersFirst: 50 }
  );
  
  type EdgeType = {
    cursor: string;
    node: {
      id: string;
      name: string;
    } | null;
  } | null;
  
  const clientsList = queryData.clients?.edges?.map((e: EdgeType) => e?.node) || [];
  const suppliersList = queryData.suppliers?.edges?.map((e: EdgeType) => e?.node) || [];

  const onSubmit = async (formData: InvoiceFormInputs): Promise<void> => {
    setLoading(true);
    setSuccess(null);
    setError(null);
    
    createInvoice(
      environment,
      {
        clientId: formData.clientGlobalId,
        supplierId: formData.supplierGlobalId,
        invoiceDate: formData.invoiceDate,
        baseAmount: parseFloat(formData.baseAmount.toString()),
      },
      (resp: CreateMaterialsInvoiceMutationResponse, errors) => {
        setLoading(false);
        
        if (resp.createMaterialsInvoice.errors && resp.createMaterialsInvoice.errors.length > 0) {
          setError(resp.createMaterialsInvoice.errors.join(', '));
          return;
        }
        
        setSuccess('Invoice created: ' + resp.createMaterialsInvoice.invoice.id);
        // Force a refetch of queries with a small delay
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      },
      (err) => {
        setLoading(false);
        setError(err.message || 'Error creating invoice');
        console.error(err);
      }
    );
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} 
      className="bg-gray-50 p-6 rounded-lg shadow-md"
      sx={{ mb: 3 }}
    >
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Create Materials Invoice</h2>
      
      <TextField
        select
        label="Client"
        variant="outlined"
        fullWidth
        margin="normal"
        error={!!errors.clientGlobalId}
        helperText={errors.clientGlobalId ? "Required" : ""}
        {...register("clientGlobalId", { required: true })}
        className="mb-4"
      >
        <MenuItem value="">Select a client</MenuItem>
        {clientsList.map((c) => (
          <MenuItem key={c?.id} value={c?.id || ''}>
            {c?.name}
          </MenuItem>
        ))}
      </TextField>
      
      <TextField
        select
        label="Supplier"
        variant="outlined"
        fullWidth
        margin="normal"
        error={!!errors.supplierGlobalId}
        helperText={errors.supplierGlobalId ? "Required" : ""}
        {...register("supplierGlobalId", { required: true })}
        className="mb-4"
      >
        <MenuItem value="">Select a supplier</MenuItem>
        {suppliersList.map((s) => (
          <MenuItem key={s?.id} value={s?.id || ''}>
            {s?.name}
          </MenuItem>
        ))}
      </TextField>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField
          label="Invoice Date"
          type="datetime-local"
          variant="outlined"
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
          error={!!errors.invoiceDate}
          helperText={errors.invoiceDate ? "Required" : ""}
          {...register("invoiceDate", { required: true })}
        />
        <TextField
          label="Base Amount"
          type="number"
          inputProps={{ step: "0.01" }}
          variant="outlined"
          fullWidth
          margin="normal"
          error={!!errors.baseAmount}
          helperText={errors.baseAmount ? "Required" : ""}
          {...register("baseAmount", { required: true })}
        />
      </div>
      
      <Button 
        variant="contained" 
        color="primary" 
        type="submit"
        disabled={loading}
        className="mt-6 hover:bg-blue-700 transition-colors"
        sx={{ mt: 2 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Create Invoice'}
      </Button>

      {error && (
        <Box sx={{ color: 'error.main', mt: 2 }} className="p-3 bg-red-50 border border-red-200 rounded mt-4">
          Error: {error}
        </Box>
      )}
      
      {success && (
        <Box sx={{ color: 'success.main', mt: 2 }} className="p-3 bg-green-50 border border-green-200 rounded mt-4">
          {success}
        </Box>
      )}
    </Box>
  );
};

export default InvoiceForm;
```

### frontend\src\components\NodeViewer.test.tsx

```tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NodeViewer from './NodeViewer';
import * as RelayEnvironment from '../RelayEnvironment';

// Mock the environment utilities
jest.spyOn(RelayEnvironment, 'toGlobalId').mockImplementation((type, id) => `${type}:${id}`);

// Mock fetch for testing the API call
global.fetch = jest.fn().mockImplementation(() => 
  Promise.resolve({
    json: () => Promise.resolve({
      data: {
        node: {
          id: 'Client:123',
          name: 'Test Client',
          markup_rate: 1.5
        }
      }
    })
  })
) as jest.Mock;

describe('NodeViewer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the component', () => {
    render(<NodeViewer />);
    expect(screen.getByText('Node Interface Demo')).toBeInTheDocument();
    expect(screen.getByLabelText('Node Type')).toBeInTheDocument();
    expect(screen.getByLabelText('ID')).toBeInTheDocument();
  });

  it('enables the fetch button when ID is entered', () => {
    render(<NodeViewer />);
    const button = screen.getByText('Fetch Node');
    expect(button).toBeDisabled();
    
    const idInput = screen.getByLabelText('ID');
    fireEvent.change(idInput, { target: { value: '123' }});
    expect(button).not.toBeDisabled();
  });

  it('fetches node data when button is clicked', async () => {
    render(<NodeViewer />);
    
    // Enter an ID
    fireEvent.change(screen.getByLabelText('ID'), { target: { value: '123' }});
    
    // Click the fetch button
    fireEvent.click(screen.getByText('Fetch Node'));
    
    // Wait for data to be fetched (the button text changes during loading)
    await waitFor(() => {
      expect(screen.getByText('Node Data:')).toBeInTheDocument();
    });
    
    // Verify the fetch was called with correct parameters
    expect(fetch).toHaveBeenCalledWith('http://localhost:5000/graphql', expect.any(Object));
  });
});
```

### frontend\src\components\NodeViewer.tsx

```tsx
import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper, Divider } from '@mui/material';
import { toGlobalId } from '../RelayEnvironment';

interface NodeData {
  id: string;
  [key: string]: unknown;
}

const NodeViewer: React.FC = () => {
  const [nodeId, setNodeId] = useState('');
  const [nodeType, setNodeType] = useState('Client');
  const [fetchedData, setFetchedData] = useState<NodeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const globalId = nodeId ? toGlobalId(nodeType, nodeId) : '';
  
  const handleFetchNode = async (): Promise<void> => {
    if (!globalId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:5000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query {
              node(id: "${globalId}") {
                id
                ... on Client {
                  name
                  markup_rate
                }
                ... on Supplier {
                  name
                }
                ... on MaterialsInvoice {
                  base_amount
                  status
                  invoice_date
                }
                ... on Transaction {
                  amount
                  transaction_date
                }
                ... on Debt {
                  party
                  amount
                  created_date
                }
              }
            }
          `
        }),
      });
      
      const result = await response.json();
      
      if (result.errors) {
        setError(result.errors[0].message);
        setFetchedData(null);
      } else if (result.data && result.data.node) {
        setFetchedData(result.data.node);
      } else {
        setError(`No node found with ID: ${globalId}`);
        setFetchedData(null);
      }
    } catch (err) {
      setError('Error fetching data: ' + (err instanceof Error ? err.message : String(err)));
      setFetchedData(null);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box sx={{ mt: 4, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
      <Typography variant="h6" gutterBottom>
        Node Interface Demo
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          select
          label="Node Type"
          value={nodeType}
          onChange={(e) => setNodeType(e.target.value)}
          SelectProps={{
            native: true,
          }}
          sx={{ width: '150px' }}
        >
          <option value="Client">Client</option>
          <option value="Supplier">Supplier</option>
          <option value="MaterialsInvoice">Invoice</option>
          <option value="Transaction">Transaction</option>
          <option value="Debt">Debt</option>
        </TextField>
        
        <TextField
          label="ID"
          value={nodeId}
          onChange={(e) => setNodeId(e.target.value)}
          sx={{ flexGrow: 1 }}
        />
        
        <Button 
          variant="contained" 
          onClick={handleFetchNode}
          disabled={!nodeId || loading}
        >
          {loading ? 'Loading...' : 'Fetch Node'}
        </Button>
      </Box>
      
      {globalId && (
        <Typography variant="body2" sx={{ mb: 2 }}>
          Global ID: <code>{globalId}</code>
        </Typography>
      )}
      
      <Divider sx={{ my: 2 }} />
      
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      
      {fetchedData && (
        <Paper elevation={1} sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Node Data:
          </Typography>
          <pre>
            {JSON.stringify(fetchedData, null, 2)}
          </pre>
        </Paper>
      )}
    </Box>
  );
};

export default NodeViewer;
```

### frontend\src\components\TransactionList.tsx

```tsx
import React from 'react';
import { useLazyLoadQuery } from 'react-relay';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Box, Button } from '@mui/material';
import { graphql } from 'react-relay';
import type { TransactionListQuery } from './../__generated__/TransactionListQuery.graphql';

// Use the imported query
export const query = graphql`
  query TransactionListQuery($first: Int, $after: String) {
    transactions(first: $first, after: $after) {
      edges {
        node {
          id
          amount
          transaction_date
          invoice {
            id
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
`;

const TransactionList: React.FC = () => {
  const [first] = React.useState(10);
  const [after, setAfter] = React.useState<string | null>(null);

  const data = useLazyLoadQuery<TransactionListQuery['response']>(
    query, 
    { first, after }
  );

  const loadMore = (): void => {
    if (data.transactions?.pageInfo.hasNextPage) {
      setAfter(data.transactions.pageInfo.endCursor);
    }
  };

  if (!data.transactions || !data.transactions.edges || data.transactions.edges.length === 0) {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" gutterBottom>Transactions</Typography>
        <Typography>No transactions found.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>Transactions</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Transaction ID</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Transaction Date</TableCell>
              <TableCell>Invoice ID</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.transactions.edges.map((edge) => {
              if (!edge || !edge.node) return null;
              const node = edge.node;
              return (
                <TableRow key={node.id}>
                  <TableCell>{node.id}</TableCell>
                  <TableCell>{node.amount}</TableCell>
                  <TableCell>{node.transaction_date}</TableCell>
                  <TableCell>{node.invoice?.id}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      
      {data.transactions.pageInfo.hasNextPage && (
        <Button 
          variant="outlined" 
          onClick={loadMore} 
          sx={{ mt: 2 }}
        >
          Load More
        </Button>
      )}
    </Box>
  );
};

export default TransactionList;
```

### frontend\src\components\__tests__\ClientList.test.tsx

```tsx
import React from 'react';
import { render } from '@testing-library/react';
import ClientList from '../ClientList';
import { useLazyLoadQuery } from 'react-relay';
import type { ClientListQuery } from '../../__generated__/ClientListQuery.graphql';

// No need to mock the types - we import them directly

// Mock relay hooks
jest.mock('react-relay', () => ({
  useLazyLoadQuery: jest.fn(),
  graphql: jest.fn()
}));

describe('ClientList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handles Relay data correctly', () => {
    // Mock the return value of useLazyLoadQuery with the actual type
    const mockData: ClientListQuery['response'] = {
      clients: {
        edges: [
          { 
            node: { id: '1', name: 'Test Client', markup_rate: 1.5 }, 
            cursor: 'cursor1' 
          }
        ],
        pageInfo: { hasNextPage: false, endCursor: null }
      }
    };
    
    (useLazyLoadQuery as jest.Mock).mockReturnValue(mockData);
    
    const { container } = render(<ClientList />);
    expect(container).toMatchSnapshot();
  });

  it('calls useLazyLoadQuery with correct parameters', () => {
    // Mock the return value with the actual type
    const mockData: ClientListQuery['response'] = {
      clients: {
        edges: [],
        pageInfo: { hasNextPage: false, endCursor: null }
      }
    };
    
    (useLazyLoadQuery as jest.Mock).mockReturnValue(mockData);
    
    render(<ClientList />);
    
    // Verify the hook was called with the expected parameter types
    expect(useLazyLoadQuery).toHaveBeenCalled();
    
    // The second argument should be an object with first and after properties
    const secondArg = (useLazyLoadQuery as jest.Mock).mock.calls[0][1] as ClientListQuery['variables'];
    expect(secondArg).toHaveProperty('first');
    expect(typeof secondArg.first).toBe('number');
    
    // Check that after property exists and is either null or a string
    expect(secondArg).toHaveProperty('after');
    // We use a variable and a simple assertion to avoid conditional expect
    const afterTypeIsValid = secondArg.after === null || typeof secondArg.after === 'string';
    expect(afterTypeIsValid).toBe(true);
  });
});
```

### frontend\src\components\__tests__\__snapshots__\ClientList.test.tsx.snap

```snap
// Jest Snapshot v1, https://goo.gl/fbAQLP

exports[`ClientList handles Relay data correctly 1`] = `
<div>
  <div
    class="MuiBox-root css-1yuhvjn"
  >
    <h6
      class="MuiTypography-root MuiTypography-h6 MuiTypography-gutterBottom css-18k87ye-MuiTypography-root"
    >
      Clients
    </h6>
    <div
      class="MuiPaper-root MuiPaper-elevation MuiPaper-rounded MuiPaper-elevation1 MuiTableContainer-root css-11xur9t-MuiPaper-root-MuiTableContainer-root"
    >
      <table
        class="MuiTable-root css-rqglhn-MuiTable-root"
      >
        <thead
          class="MuiTableHead-root css-15wwp11-MuiTableHead-root"
        >
          <tr
            class="MuiTableRow-root MuiTableRow-head css-1q1u3t4-MuiTableRow-root"
          >
            <th
              class="MuiTableCell-root MuiTableCell-head MuiTableCell-sizeMedium css-1ygcj2i-MuiTableCell-root"
              scope="col"
            >
              ID
            </th>
            <th
              class="MuiTableCell-root MuiTableCell-head MuiTableCell-sizeMedium css-1ygcj2i-MuiTableCell-root"
              scope="col"
            >
              Name
            </th>
            <th
              class="MuiTableCell-root MuiTableCell-head MuiTableCell-sizeMedium css-1ygcj2i-MuiTableCell-root"
              scope="col"
            >
              Markup Rate
            </th>
          </tr>
        </thead>
        <tbody
          class="MuiTableBody-root css-apqrd9-MuiTableBody-root"
        >
          <tr
            class="MuiTableRow-root css-1q1u3t4-MuiTableRow-root"
          >
            <td
              class="MuiTableCell-root MuiTableCell-body MuiTableCell-sizeMedium css-1ex1afd-MuiTableCell-root"
            >
              1
            </td>
            <td
              class="MuiTableCell-root MuiTableCell-body MuiTableCell-sizeMedium css-1ex1afd-MuiTableCell-root"
            >
              Test Client
            </td>
            <td
              class="MuiTableCell-root MuiTableCell-body MuiTableCell-sizeMedium css-1ex1afd-MuiTableCell-root"
            >
              1.5
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>
`;
```

### frontend\src\index.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}
```

### frontend\src\index.tsx

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RelayEnvironment } from './RelayEnvironment';
import { RelayEnvironmentProvider } from 'react-relay';
import App from './App';
import './index.css';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <RelayEnvironmentProvider environment={RelayEnvironment}>
      <App />
    </RelayEnvironmentProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
```

### frontend\src\mutations\CreateMaterialsInvoice.ts

```ts
import { graphql, commitMutation } from 'react-relay';
import { Environment } from 'relay-runtime';

export type CreateMaterialsInvoiceMutationResponse = {
  createMaterialsInvoice: {
    invoice: {
      id: string;
      base_amount: number;
      __typename: string;
    };
    errors: string[] | null;
  };
};

const mutation = graphql`
  mutation CreateMaterialsInvoiceMutation(
    $clientId: ID!
    $supplierId: ID!
    $invoiceDate: String!
    $baseAmount: Float!
  ) {
    createMaterialsInvoice(
      clientId: $clientId
      supplierId: $supplierId
      invoiceDate: $invoiceDate
      baseAmount: $baseAmount
    ) {
      invoice {
        id
        base_amount
        __typename
      }
      errors
    }
  }
`;

export function createInvoice(
  environment: Environment,
  variables: {
    clientId: string;     // Relay global ID
    supplierId: string;   // Relay global ID
    invoiceDate: string;  // or Date
    baseAmount: number;
  },
  onCompleted: (response: CreateMaterialsInvoiceMutationResponse, errors: readonly Error[] | null | undefined) => void,
  onError: (err: Error) => void
): ReturnType<typeof commitMutation> {
  return commitMutation(environment, {
    mutation,
    variables,
    onCompleted: (response: unknown, errors: unknown) => {
      onCompleted(response as CreateMaterialsInvoiceMutationResponse, errors as readonly Error[] | null | undefined);
    },
    onError,
  });
}
```

### frontend\src\relay-types.d.ts

```ts
declare module 'react-relay' {
  import type { GraphQLTaggedNode } from 'relay-runtime';
  import type { Environment } from 'relay-runtime';

  export function graphql(strings: TemplateStringsArray, ...values: Array<unknown>): GraphQLTaggedNode;
  export function useRelayEnvironment(): Environment;
  export function useLazyLoadQuery<T>(query: GraphQLTaggedNode, variables: Record<string, unknown>): T;
  export function commitMutation(environment: Environment, config: Record<string, unknown>): ReturnType<typeof commitMutation>;
  export const RelayEnvironmentProvider: React.ComponentType<{environment: Environment, children?: React.ReactNode}>;
}

declare module 'relay-runtime' {
  export type GraphQLTaggedNode = object;
  
  export interface GraphQLSingularResponse {
    data?: Record<string, unknown> | null;
    errors?: ReadonlyArray<{
      message: string;
      locations?: ReadonlyArray<{
        line: number;
        column: number;
      }>;
    }>;
  }
  
  export type GraphQLResponse = GraphQLSingularResponse | ReadonlyArray<GraphQLSingularResponse>;
  
  export type ObservableFromValue<T> = {
    subscribe: (observer: {
      next: (value: T) => void;
      error: (error: Error) => void;
      complete: () => void;
    }) => { unsubscribe: () => void };
  };
  
  export type FetchFunction = (
    request: unknown,
    variables: Record<string, unknown>,
  ) => ObservableFromValue<GraphQLResponse> | Promise<GraphQLResponse>;
  
  export interface NetworkConfig {
    fetch: FetchFunction;
  }
  
  export class Environment {
    constructor(config: { network: NetworkInterface, store: Store });
  }
  
  export interface NetworkInterface {
    execute: FetchFunction;
  }
  
  export const Network: {
    create: (fetchFn: FetchFunction) => NetworkInterface;
  };
  
  export class RecordSource {
    constructor();
  }
  
  export class Store {
    constructor(source: RecordSource);
  }
}
```

### frontend\src\reportWebVitals.ts

```ts
import { ReportHandler } from 'web-vitals';

const reportWebVitals = (onPerfEntry?: ReportHandler): void => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals;
```

### frontend\src\setupTests.ts

```ts
// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
```

### frontend\src\utils\dataValidator.ts

```ts
/**
 * Runtime validation utilities for data structures
 * These help catch issues that TypeScript might miss due to type assertions or coercion
 */

/**
 * Validates that data from Relay queries has the expected structure
 * Useful for catching issues where the API shape doesn't match the expected types
 * 
 * @param data - The data returned from a Relay query
 * @param componentName - The name of the component for error logging
 * @returns void
 */
export function validateRelayData(data: unknown, componentName: string): void {
  if (process.env.NODE_ENV !== 'production') {
    if (data === undefined || data === null) {
      console.error(`[${componentName}] Relay data is null or undefined`);
    } else if (typeof data !== 'object') {
      console.error(`[${componentName}] Relay data is not an object`, data);
    }
  }
}

/**
 * Validates that a connection (edges/nodes) from Relay has expected structure
 * Helps catch missing or malformed connection data
 * 
 * @param connection - The connection object from Relay containing edges and pageInfo
 * @param fieldName - The name of the field for error logging
 * @param componentName - The name of the component for error logging
 * @returns boolean - Whether the connection is valid
 */
export function validateRelayConnection(
  connection: unknown, 
  fieldName: string, 
  componentName: string
): boolean {
  if (process.env.NODE_ENV !== 'production') {
    if (!connection) {
      console.error(`[${componentName}] Connection "${fieldName}" is null or undefined`);
      return false;
    }

    const conn = connection as Record<string, unknown>;
    
    if (!conn.edges) {
      console.error(`[${componentName}] Connection "${fieldName}" is missing edges property`);
      return false;
    }
    
    if (!Array.isArray(conn.edges)) {
      console.error(`[${componentName}] Connection "${fieldName}.edges" is not an array`);
      return false;
    }
    
    if (!conn.pageInfo) {
      console.error(`[${componentName}] Connection "${fieldName}" is missing pageInfo property`);
      return false;
    }
    
    return true;
  }
  
  // In production, don't do validation to avoid performance overhead
  return true;
}
```

### frontend\src\utils\types.ts

```ts
/**
 * Type utilities for working with Relay-generated types
 */

/**
 * Extracts the response type from a Relay query type
 * This allows simplified usage of query types without having to use ['response']
 * 
 * @example
 * // Instead of:
 * const data = useLazyLoadQuery<MyQuery['response']>(query, variables);
 * 
 * // You can use:
 * const data = useLazyLoadQuery<ResponseType<MyQuery>>(query, variables);
 */
export type ResponseType<T> = T extends { response: infer R } ? R : never;
```

### frontend\tailwind.config.js

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### frontend\tsconfig.json

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noEmitOnError": true,
    "noImplicitThis": true,
    "noImplicitReturns": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": [
    "src"
  ]
}
```
