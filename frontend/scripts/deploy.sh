#!/bin/bash

# Exit on any error
set -e

echo "🔍 Starting deployment process..."

# Ensure we're in the frontend directory
cd "$(dirname "$0")/.."

# Check for Node.js version compatibility
REQUIRED_NODE_VERSION="v18.15.0"
NODE_VERSION=$(node -v)
echo "📋 Node version: $NODE_VERSION"

if [[ "$NODE_VERSION" != "$REQUIRED_NODE_VERSION" ]]; then
  echo "⚠️ Warning: Node version mismatch! Using $NODE_VERSION, expected $REQUIRED_NODE_VERSION"
  echo "This may cause inconsistent builds between environments"
  
  # Uncomment the following line to fail the build on version mismatch
  # exit 1
fi

# Ensure correct TypeScript version
REQUIRED_TS_VERSION="4.9.5"
TS_VERSION=$(node -e "console.log(require('./package.json').dependencies.typescript || require('./package.json').devDependencies.typescript)")
echo "📋 TypeScript version: $TS_VERSION"

if [[ "$TS_VERSION" != "^$REQUIRED_TS_VERSION" && "$TS_VERSION" != "$REQUIRED_TS_VERSION" ]]; then
  echo "⚠️ Warning: TypeScript version mismatch! Using $TS_VERSION, expected $REQUIRED_TS_VERSION"
  echo "This may cause inconsistent builds between environments"
  
  # Uncomment the following line to fail the build on version mismatch
  # exit 1
fi

# Clear any existing node_modules and build artifacts
echo "🧹 Cleaning previous build artifacts..."
rm -rf node_modules build

# Install all dependencies from scratch using the exact versions in package-lock.json
echo "📦 Installing dependencies from package-lock.json..."
npm ci

# Fix any import path issues in test files
echo "🔧 Fixing import paths in test files..."
npm run fix-test-imports

# Run enhanced type checking
echo "🔎 Running enhanced type check..."
npm run type-check-all

# Run ESLint
echo "🧐 Running lint check..."
npm run lint

# Run the Relay compiler
echo "🧩 Running Relay compiler..."
npm run relay

# Build the production version
echo "🔨 Building production bundle..."
npm run build

echo "✅ Build completed successfully!"
echo "📦 Production build is available in the 'build' directory"
echo "📝 Use 'npm install -g serve && serve -s build' to test the production build locally" 