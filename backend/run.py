import os
import sys
import subprocess
import platform

def main():
    # Set path to the virtual environment Python
    if platform.system() == "Windows":
        python_exe = os.path.join("venv", "Scripts", "python")
    else:
        python_exe = os.path.join("venv", "bin", "python")
    
    # Check if db commands were passed
    if len(sys.argv) > 1 and sys.argv[1] == "db":
        from flask.cli import FlaskGroup
        from app import create_app
        
        # Create Flask CLI with our application
        cli = FlaskGroup(create_app=create_app)
        
        # Run db commands
        cli.main(sys.argv[1:])
    else:
        print("Starting Flask server...")
        os.system(f'"{python_exe}" app.py')

if __name__ == "__main__":
    main() 