import os
import subprocess
import sys
import platform

def run_command(command):
    print(f"Running: {command}")
    process = subprocess.run(command, shell=True)
    if process.returncode != 0:
        print(f"Command failed with exit code {process.returncode}")
        sys.exit(process.returncode)

def main():
    # Determine the correct Python command
    python_cmd = "python" if platform.system() == "Windows" else "python3"
    
    # Create virtual environment if it doesn't exist
    if not os.path.exists("venv"):
        print("Creating virtual environment...")
        # Run the venv command directly as a subprocess call
        run_command(f"{python_cmd} -m venv venv")
        print("Virtual environment created.")
    
    # Install dependencies directly using the pip executable
    print("Installing dependencies...")
    if platform.system() == "Windows":
        pip_cmd = os.path.join("venv", "Scripts", "pip")
        python_exe = os.path.join("venv", "Scripts", "python")
    else:
        pip_cmd = os.path.join("venv", "bin", "pip")
        python_exe = os.path.join("venv", "bin", "python")
    
    # First, make sure pip is up to date
    run_command(f'"{python_exe}" -m pip install --upgrade pip')
    
    # Uninstall any potentially conflicting packages
    run_command(f'"{pip_cmd}" uninstall -y graphene graphene-sqlalchemy graphql-relay flask-graphql')
    
    # Install dependencies from the updated requirements.txt
    run_command(f'"{pip_cmd}" install -r requirements.txt')
    
    # Set the FLASK_APP environment variable
    os.environ["FLASK_APP"] = "app.py"
    
    # Initialize database
    print("Initializing database...")
    
    # Only run db init if migrations directory doesn't exist
    if not os.path.exists("migrations"):
        run_command(f'"{python_exe}" -m flask db init')
    else:
        print("Migrations directory already exists, skipping initialization.")
    
    # Always run migrate and upgrade
    run_command(f'"{python_exe}" -m flask db migrate -m "initial migration"')
    run_command(f'"{python_exe}" -m flask db upgrade')
    
    # Seed database
    seed = input("Do you want to seed the database with test data? (y/n): ").lower()
    if seed == 'y':
        print("Seeding database...")
        run_command(f'"{python_exe}" seed.py')
    
    print("Backend setup completed successfully!")
    print("The application uses Ariadne for GraphQL (Python 3.12+ compatible)")
    print("You can start the application with: python app.py")
    print("Access the GraphQL playground at: http://localhost:5000/graphql")

if __name__ == "__main__":
    main() 