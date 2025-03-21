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
