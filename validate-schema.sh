#!/bin/bash
# Schema generation and relay compilation script
echo "🔍 Generating GraphQL schema..."

cd frontend
node scripts/generate-schema.js

if [ $? -ne 0 ]; then
    echo "❌ Schema generation failed."
    exit 1
fi

echo "🔄 Running Relay compiler to generate artifacts..."
npm run relay

if [ $? -ne 0 ]; then
    echo "❌ Relay compilation failed."
    exit 1
fi

echo "✅ Relay compilation successful."
echo "🚀 Your schema is updated and ready to use!" 