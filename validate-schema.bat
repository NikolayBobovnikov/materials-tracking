@echo off
:: Schema generation and relay compilation script
echo 🔍 Generating GraphQL schema...

cd frontend
call node scripts/generate-schema.js

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Schema generation failed.
    exit /b %ERRORLEVEL%
)

echo 🔄 Running Relay compiler to generate artifacts...
call npm run relay

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Relay compilation failed.
    exit /b %ERRORLEVEL%
)

echo ✅ Relay compilation successful.
echo 🚀 Your schema is updated and ready to use! 