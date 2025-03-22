"""
Script to generate the GraphQL schema for the frontend from the backend's Ariadne schema.
This ensures we maintain a single source of truth for the GraphQL schema.
"""

import os
import sys

# Ensure we can import the backend modules
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)
sys.path.insert(0, os.path.dirname(current_dir))

# Import from the local schema module
from schema import type_defs

# Always write schema to a fixed location in the backend directory
schema_path = os.path.join(current_dir, 'schema.graphql')

with open(schema_path, 'w') as f:
    f.write(type_defs)

print(f"Schema written to {schema_path}")

# For build-time processing, also try to write to the frontend directory
try:
    frontend_dir = os.path.join(os.path.dirname(current_dir), 'frontend')
    if os.path.exists(frontend_dir):
        frontend_schema_path = os.path.join(frontend_dir, 'schema.graphql')
        with open(frontend_schema_path, 'w') as f:
            f.write(type_defs)
        print(f"Schema also written to {frontend_schema_path}")
except Exception as e:
    print(f"Note: Could not write schema to frontend directory: {e}")
    # Non-fatal, continue 