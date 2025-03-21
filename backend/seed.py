from app import create_app
from backend.models import db, Client, Supplier

app = create_app()

with app.app_context():
    db.session.add(Client(name="Test Client", markup_rate=0.15))
    db.session.add(Supplier(name="Test Supplier"))
    db.session.commit()
    print("Database seeded successfully!") 