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