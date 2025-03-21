# GraphQL Schema Generation

This document explains how the GraphQL schema is generated from the backend to the frontend.

## Overview

The frontend uses Relay which requires a GraphQL schema file to generate type-safe artifacts during build. This schema needs to be kept in sync with the backend's schema to ensure compatibility.

## How Schema Generation Works

1. The backend defines its GraphQL schema in `backend/schema.py`
2. A Python script (`backend/generate_schema.py`) extracts this schema and writes it to `frontend/schema.graphql`
3. The frontend's build process uses this schema file for Relay compilation

## Manual Schema Generation

You can manually generate the schema by running:

```bash
# From the project root
./validate-schema.sh  # or validate-schema.bat on Windows

# Or directly from the frontend directory
npm run generate-schema
npm run relay
```

## Automatic Schema Generation

The schema is automatically generated in the following scenarios:

1. **During development**: When running `npm run dev`
2. **During builds**: When running `npm run build`
3. **In Docker builds**: During the container build process

## Troubleshooting

If you encounter schema-related errors:

1. Ensure the backend is properly set up
2. Run `npm run generate-schema` manually to update the schema
3. Check for any errors in the schema generation process
4. If using Docker, ensure both services are correctly configured

## Schema Changes

When making schema changes:

1. Update the backend schema in `backend/schema.py`
2. Run `./validate-schema.sh` to update the frontend schema
3. Update any affected frontend components

## Docker Setup

The Docker setup ensures the schema is generated during the build process:

1. The Dockerfile installs Python for schema generation
2. It attempts to find and run the schema generation script
3. If successful, it updates the schema before building the frontend 