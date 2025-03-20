# Materials Tracking Module

A small application that allows users to record materials invoices for clients, automatically create transactions with markups, and generate debt records for both clients and suppliers.

## Technologies Used

### Backend
- Python 3
- Flask
- Flask-SQLAlchemy
- Flask-Migrate
- Graphene (GraphQL)
- SQLite

### Frontend
- React
- TypeScript
- GraphQL (Apollo Client)
- Tailwind CSS
- Material-UI
- react-hook-form

## Project Structure

```
project-root/
├─ backend/
│   ├─ app.py
│   ├─ models.py
│   ├─ schema.py
│   ├─ seed.py
│   ├─ setup.py
│   ├─ run.py
│   └─ requirements.txt
├─ frontend/
│   ├─ package.json
│   ├─ src/
│   │   ├─ components/
│   │   │   ├─ InvoiceForm.tsx
│   │   │   ├─ DebtList.tsx
│   │   │   └─ TransactionList.tsx
│   │   ├─ App.tsx
│   │   └─ index.tsx
│   ├─ public/
│   ├─ setup.js
│   ├─ run.js
│   └─ tailwind.config.js
├─ start.py
├─ start.bat
└─ start.sh
```

## Quick Start

### Using Automation Scripts

#### Windows
Simply double-click on `start.bat` or run:
```
start.bat
```

#### Linux/Mac
Make the script executable and run it:
```
chmod +x start.sh
./start.sh
```

#### Any Platform (Python)
```
python start.py
```
or
```
python3 start.py
```

The script will:
1. Ask if you want to run setup first (for first-time use)
2. If yes, it will set up both backend and frontend
3. Start the backend server
4. Start the frontend development server

### Manual Setup and Installation

#### Backend

1. Navigate to the `backend/` folder
2. Create a virtual environment:
   ```
   python -m venv venv
   # Windows
   .\venv\Scripts\activate
   # Linux/Mac
   source venv/bin/activate
   ```
3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
4. Initialize the database:
   ```
   flask db init
   flask db migrate
   flask db upgrade
   ```
5. Seed the database (optional):
   ```
   python seed.py
   ```
6. Run the Flask server:
   ```
   python app.py
   ```

#### Frontend

1. Navigate to the `frontend/` folder
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm start
   ```

## Usage

1. Access the frontend at http://localhost:3000
2. Access the GraphQL interface at http://localhost:5000/graphql

## Features

- Record materials invoices for clients
- Automatically create transactions with markups based on client contracts
- Generate debt records for both clients and suppliers
- View all transactions and debts in a tabular format 

## Schema Management

The GraphQL schema is defined in the backend using Ariadne's schema-first approach in `schema.py`. 
To maintain a single source of truth, we generate the frontend schema from the backend schema:

```
# Generate frontend schema from backend
python backend/generate_schema.py
```

This ensures that both backend and frontend are always in sync with the same GraphQL schema.

## Code Organization

- All GraphQL resolver logic is consolidated in `schema.py` to avoid duplication
- Frontend components use Relay's data fetching capabilities with `useLazyLoadQuery`
- After mutations, we refresh the UI to show updated data 