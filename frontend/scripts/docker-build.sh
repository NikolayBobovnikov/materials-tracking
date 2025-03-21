#!/bin/bash
# This script builds the frontend in a Docker container to ensure build consistency
# It can be used to verify that your local changes will build successfully in CI/CD

set -e

# Get the directory of the script
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$DIR")"

# Display info about the build
echo "🐳 Starting Docker build for frontend..."
echo "📂 Project directory: $PROJECT_DIR"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed or not in PATH"
    echo "Please install Docker and try again"
    exit 1
fi

# Build the Docker image
echo "🏗️ Building Docker image..."
docker build -t frontend-build "$PROJECT_DIR"

# Check if the build was successful
if [ $? -eq 0 ]; then
    echo "✅ Docker build completed successfully!"
    
    # Optionally run tests in the container
    read -p "Do you want to run tests in the container? (y/n) " run_tests
    if [[ $run_tests =~ ^[Yy]$ ]]; then
        echo "🧪 Running tests in Docker container..."
        docker run --rm frontend-build sh -c "cd /app && npm test -- --watchAll=false"
    fi
    
    # Optionally serve the built app
    read -p "Do you want to serve the built app locally? (y/n) " serve_app
    if [[ $serve_app =~ ^[Yy]$ ]]; then
        echo "🚀 Serving the built app on http://localhost:8080..."
        docker run --rm -p 8080:80 frontend-build
    fi
else
    echo "❌ Docker build failed"
    exit 1
fi 