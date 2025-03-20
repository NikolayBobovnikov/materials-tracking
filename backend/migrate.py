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