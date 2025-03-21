#!/bin/sh
# Schema generation script that can be used both in Docker and local development

# Check if we're in a container by looking for /.dockerenv
if [ -f "/.dockerenv" ]; then
  BACKEND_PATHS="/backend_mount /backend ../backend"
  CONTEXT="Docker container"
else
  # Local development - try to find backend relative to current script
  SCRIPT_DIR="$(dirname "$(readlink -f "$0")")"
  FRONTEND_DIR="$(dirname "$SCRIPT_DIR")"
  PROJECT_ROOT="$(dirname "$FRONTEND_DIR")"
  BACKEND_DIR="$PROJECT_ROOT/backend"
  BACKEND_PATHS="$BACKEND_DIR"
  CONTEXT="Local development"
fi

echo "🔍 Running schema generation ($CONTEXT)..."

# Try each potential backend location
for backend_path in $BACKEND_PATHS; do
  if [ -d "$backend_path" ] && [ -f "$backend_path/generate_schema.py" ]; then
    echo "✅ Found backend at $backend_path"
    cd "$backend_path"
    python3 generate_schema.py || python generate_schema.py
    exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
      echo "✅ Schema generated successfully"
      exit 0
    else
      echo "❌ Schema generation failed with code $exit_code"
      exit $exit_code
    fi
  fi
done

echo "⚠️ Warning: No backend found with generate_schema.py"

# Check if schema already exists
if [ -f "$FRONTEND_DIR/schema.graphql" ]; then
  echo "📄 Using existing schema.graphql"
  exit 0
else
  echo "⚠️ No schema found and no backend available"
  echo "📝 Creating minimal placeholder schema to allow build to continue"
  echo "type Query { _placeholder: String }" > "$FRONTEND_DIR/schema.graphql"
  exit 0
fi 