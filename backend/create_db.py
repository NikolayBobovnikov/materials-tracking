"""
Simple script to create the database directly from the models
"""

from flask import Flask
import os

# Create a minimal Flask app
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('SQLALCHEMY_DATABASE_URI', 'sqlite:///test_decimal.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Import and initialize the database
from models import db

# Initialize the app with the database
db.init_app(app)

# Create the database
with app.app_context():
    print("Creating database schema...")
    db.create_all()
    print("Database created successfully!") 