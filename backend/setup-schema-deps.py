"""
Simple script to install the minimal dependencies needed for schema generation.
"""

import subprocess
import sys

def install_deps():
    print("Installing minimal dependencies for schema generation...")
    
    # List of packages needed for schema generation
    packages = ["ariadne", "graphql-core"]
    
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install"] + packages)
        print("Dependencies installed successfully!")
        return True
    except subprocess.CalledProcessError:
        print("Failed to install dependencies.")
        return False

if __name__ == "__main__":
    success = install_deps()
    sys.exit(0 if success else 1) 