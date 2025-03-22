"""
Alternative script to extract GraphQL schema without importing modules.
This is a fallback method when there are dependency issues.
"""

import os
import re
import sys

def extract_schema_from_file():
    # Get the path to the schema.py file
    schema_file = os.path.join(os.path.dirname(__file__), 'schema.py')
    
    if not os.path.exists(schema_file):
        print(f"Error: Schema file not found at {schema_file}")
        return None
    
    # Read the file content
    with open(schema_file, 'r') as f:
        content = f.read()
    
    # Extract the schema definition using a regex pattern
    pattern = r'type_defs\s*=\s*"""(.*?)"""'
    match = re.search(pattern, content, re.DOTALL)
    
    if match:
        return match.group(1)
    else:
        print("Error: Could not find GraphQL schema definition in schema.py")
        return None

def write_schema_to_frontend():
    schema_content = extract_schema_from_file()
    
    if not schema_content:
        return False
    
    # Write to frontend/schema.graphql
    frontend_dir = os.path.dirname(os.path.dirname(__file__))
    frontend_schema_path = os.path.join(frontend_dir, 'frontend', 'schema.graphql')
    
    with open(frontend_schema_path, 'w') as f:
        f.write(schema_content)
    
    print(f"Schema extracted and written to {frontend_schema_path}")
    return True

if __name__ == "__main__":
    success = write_schema_to_frontend()
    sys.exit(0 if success else 1) 