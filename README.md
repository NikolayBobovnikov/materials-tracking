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

- **GraphQL API** built with Ariadne (Python) 
- **React Frontend** with Material UI and Relay
- **SQLAlchemy ORM** with SQLite database
- **Docker** support for easy deployment
- **Auto-generated GraphQL schema** from backend to frontend

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- npm 9+
- Docker and Docker Compose (optional)

### Local Development

#### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the development server:
```bash
python app.py
```

The GraphQL API will be available at http://localhost:5000/graphql.

#### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Generate the GraphQL schema:
```bash
npm run generate-schema
```

4. Run the development server:
```bash
npm run dev
```

The frontend will be available at http://localhost:3000.

### Docker Deployment

To run the entire application with Docker:

```bash
docker-compose up -d
```

This will:
1. Build and start the backend service
2. Build and start the frontend service
3. Generate the GraphQL schema during build (using backend mount)

The application will be accessible at:
- Frontend: http://localhost:3000
- Backend GraphQL API: http://localhost:5000/graphql

## Schema Management

The frontend relies on a GraphQL schema file to generate type-safe Relay artifacts. We use a simple approach to keep the frontend schema in sync with the backend:

```bash
# Generate schema and compile relay from project root
./validate-schema.sh  # or validate-schema.bat on Windows
```

This process:
- Extracts the latest schema from the backend
- Updates the frontend schema file
- Regenerates Relay artifacts

For Docker builds, the backend is temporarily mounted to the frontend container during build time to generate the latest schema, ensuring the Docker image has the most up-to-date schema.

## Development Workflow

### Making Schema Changes

When you modify the GraphQL schema in the backend:

1. Update the schema in `backend/schema.py`
2. Run `./validate-schema.sh` to update the frontend schema
3. Update your React components as needed
4. Test thoroughly before committing

## License

This project is licensed under the terms of the license included in the repository. 