import os
import subprocess
import sys
import platform
import time
import threading

def run_backend():
    os.chdir('backend')
    # Create a modified environment with PYTHONPATH set to include the project root
    env = os.environ.copy()
    env['PYTHONPATH'] = os.path.dirname(os.path.abspath(__file__)) + os.pathsep + env.get('PYTHONPATH', '')
    
    if platform.system() == "Windows":
        subprocess.run(["python", "run.py"], check=True, env=env)
    else:
        subprocess.run(["python3", "run.py"], check=True, env=env)

def run_frontend():
    os.chdir('frontend')
    if platform.system() == "Windows":
        subprocess.run(["node", "run.js"], check=True)
    else:
        subprocess.run(["node", "run.js"], check=True)

def setup_backend():
    print("Setting up backend...")
    os.chdir('backend')
    try:
        if platform.system() == "Windows":
            subprocess.run(["python", "setup.py"], check=True)
        else:
            subprocess.run(["python3", "setup.py"], check=True)
    except subprocess.CalledProcessError as e:
        print(f"Backend setup failed with error code {e.returncode}")
        sys.exit(e.returncode)
    os.chdir('..')

def setup_frontend():
    print("Setting up frontend...")
    os.chdir('frontend')
    try:
        subprocess.run(["node", "setup.js"], check=True)
    except subprocess.CalledProcessError as e:
        print(f"Frontend setup failed with error code {e.returncode}")
        sys.exit(e.returncode)
    os.chdir('..')

def sync_graphql_schema():
    """Synchronize GraphQL schema from backend to frontend"""
    print("Synchronizing GraphQL schema...")
    
    # Remember original directory
    original_dir = os.getcwd()
    
    try:
        # Execute schema generation script in backend
        os.chdir('backend')
        if platform.system() == "Windows":
            subprocess.run(["python", "generate_schema.py"], check=True)
        else:
            subprocess.run(["python3", "generate_schema.py"], check=True)
        
        # Run relay compiler in frontend
        os.chdir('../frontend')
        subprocess.run(["npm", "run", "relay"], check=True)
        
        print("✅ Schema synchronized successfully")
    except subprocess.CalledProcessError as e:
        print(f"❌ Schema synchronization failed with error code {e.returncode}")
        sys.exit(e.returncode)
    finally:
        # Return to original directory
        os.chdir(original_dir)

def main():
    # Store the original directory
    original_dir = os.getcwd()
    
    try:
        # Check if setup is needed
        setup = input("Do you want to run setup first? (y/n): ").lower()
        if setup == 'y':
            setup_backend()
            setup_frontend()
        
        # Synchronize GraphQL schema
        sync_schema = input("Do you want to synchronize GraphQL schema? (y/n): ").lower()
        if sync_schema == 'y':
            sync_graphql_schema()
        
        # Start backend in a separate thread
        print("Starting backend server...")
        backend_thread = threading.Thread(target=run_backend)
        backend_thread.daemon = True
        backend_thread.start()
        
        # Give the backend some time to start
        time.sleep(3)
        
        # Start frontend
        print("Starting frontend server...")
        os.chdir(original_dir)  # Reset to original directory
        run_frontend()
        
    except KeyboardInterrupt:
        print("\nShutting down...")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        # Always return to the original directory
        os.chdir(original_dir)

if __name__ == "__main__":
    main() 