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
import logging
from flask import Flask, request, jsonify
from flask_migrate import Migrate
from flask_cors import CORS
from models import db
from ariadne import graphql_sync
from ariadne.explorer import ExplorerGraphiQL
from schema import schema
from sqlalchemy import text

def create_app(testing=False):
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        filename='app.log',
        filemode='a'
    )
    logger = logging.getLogger(__name__)
    
    app = Flask(__name__)

    # Load DB URI from .env or fallback to local SQLite
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('SQLALCHEMY_DATABASE_URI', 'sqlite:///test.db')
    if testing:
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
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
        return ExplorerGraphiQL().html(None), 200

    @app.route("/graphql", methods=["POST"])
    def graphql_server():
        # Handle GraphQL queries
        data = request.get_json()
        
        # Enhanced logging for debugging
        logger.info("=" * 80)
        logger.info("GraphQL Request from: %s", request.remote_addr)
        logger.info("Request Headers: %s", dict(request.headers))
        logger.info("GraphQL Query: %s", data.get('query') if data else None)
        logger.info("GraphQL Variables: %s", data.get('variables') if data else None)
        
        success, result = graphql_sync(
            schema,
            data,
            context_value={"request": request},
            debug=app.debug
        )
        
        # Log response data
        if success:
            logger.info("GraphQL Response: %s", result)
        else:
            logger.error("GraphQL Errors: %s", result.get('errors'))
        
        logger.info("=" * 80)
        
        status_code = 200 if success else 400
        return jsonify(result), status_code

    @app.route('/healthcheck', methods=['GET'])
    def healthcheck():
        """
        Simple health check endpoint for Docker and other monitoring systems.
        This validates that the application is running and the database is accessible.
        """
        try:
            # Check database connection with proper text() wrapper
            db.session.execute(text('SELECT 1'))
            return jsonify({
                "status": "healthy",
                "message": "Application is running and database is accessible"
            }), 200
        except Exception as e:
            logger.error(f"Health check failed: {str(e)}")
            return jsonify({
                "status": "unhealthy",
                "message": f"Health check failed: {str(e)}"
            }), 500

    app.logger.info("Flask application initialized with Ariadne GraphQL")

    return app

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    host = os.environ.get('HOST', '0.0.0.0')
    debug = os.environ.get('DEBUG', 'false').lower() == 'true'
    
    logger = logging.getLogger(__name__)
    logger.info(f"Starting server on {host}:{port}, debug={debug}")
    
    app = create_app()
    app.run(host=host, port=port, debug=debug)
