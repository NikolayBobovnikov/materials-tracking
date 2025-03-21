import argparse
from decimal import Decimal
from app import create_app
from models import db, Client, Supplier

def seed_data():
    app = create_app()
    with app.app_context():
        # Check if data already exists to avoid duplicates
        if not Client.query.first():
            print("Seeding database with sample data...")
            db.session.add(Client(name="Test Client", markup_rate=Decimal('0.15')))
            db.session.add(Supplier(name="Test Supplier"))
            db.session.commit()
            print("Database seeded successfully!")
        else:
            print("Database already contains data, skipping seeding.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed the database.")
    parser.add_argument("--seed", action="store_true", help="Seed the database with test data")
    parser.add_argument("--force", action="store_true", help="Force seeding even if data exists")
    args = parser.parse_args()
    
    if args.seed:
        seed_data() 