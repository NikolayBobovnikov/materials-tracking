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

# Write the schema to a file for frontend use
frontend_schema_path = os.path.join(os.path.dirname(current_dir), 'frontend', 'schema.graphql')

with open(frontend_schema_path, 'w') as f:
    f.write(type_defs)

print(f"Schema written to {frontend_schema_path}") 