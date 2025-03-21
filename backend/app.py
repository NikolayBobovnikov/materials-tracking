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
from ariadne.explorer import ExplorerGraphiQL
# Use Ariadne's built-in playground handler instead of hardcoded HTML
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
        playground_html = ExplorerGraphiQL(endpoint="/graphql").html(None)
        return playground_html, 200

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
