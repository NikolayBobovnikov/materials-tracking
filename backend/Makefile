# Backend Makefile for Financial Management Application

.PHONY: setup setup-env init-db seed run

# Default target
all: setup

# Setup environment and dependencies
setup: setup-env init-db

# Create virtual environment and install dependencies
setup-env:
	@echo "Creating virtual environment..."
	python -m venv venv || python3 -m venv venv
	@echo "Upgrading pip..."
	./venv/bin/pip install --upgrade pip
	@echo "Installing dependencies..."
	./venv/bin/pip install -r requirements.txt
	@echo "Environment setup complete!"

# Initialize database with migrations
init-db:
	@echo "Initializing database..."
	FLASK_APP=app.py ./venv/bin/flask db init || echo "Migrations already initialized."
	FLASK_APP=app.py ./venv/bin/flask db migrate -m "initial migration"
	FLASK_APP=app.py ./venv/bin/flask db upgrade
	@echo "Database initialization complete!"

# Seed database with sample data
seed:
	@echo "Seeding database..."
	./venv/bin/python seed.py --seed
	@echo "Database seeding complete!"

# Run the application
run:
	@echo "Starting Flask application..."
	./venv/bin/python app.py 