#!/usr/bin/env pwsh
# Schema generation script for Windows environments

# Determine paths
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$FrontendDir = Split-Path -Parent $ScriptDir
$ProjectRoot = Split-Path -Parent $FrontendDir
$BackendDir = Join-Path $ProjectRoot "backend"
$SchemaFile = Join-Path $FrontendDir "schema.graphql"

Write-Host "🔍 Running schema generation (Windows)..." -ForegroundColor Cyan

# Look for backend in standard location
if (Test-Path -Path (Join-Path $BackendDir "generate_schema.py")) {
    Write-Host "✅ Found backend at $BackendDir" -ForegroundColor Green
    
    # Save current location and change to backend directory
    Push-Location $BackendDir
    
    try {
        # Try to generate schema with Python
        python generate_schema.py
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Schema generated successfully" -ForegroundColor Green
            Pop-Location
            exit 0
        } else {
            Write-Host "❌ Schema generation failed with code $LASTEXITCODE" -ForegroundColor Red
            Pop-Location
            exit $LASTEXITCODE
        }
    }
    catch {
        Write-Host "❌ Error running Python: $_" -ForegroundColor Red
        Pop-Location
        
        # Continue to fallback options
    }
} else {
    Write-Host "⚠️ Backend not found at expected location: $BackendDir" -ForegroundColor Yellow
}

# Check if schema already exists
if (Test-Path -Path $SchemaFile) {
    Write-Host "📄 Using existing schema.graphql" -ForegroundColor Yellow
    exit 0
} else {
    Write-Host "⚠️ No schema found and no backend available" -ForegroundColor Yellow
    Write-Host "📝 Creating minimal placeholder schema" -ForegroundColor Yellow
    
    # Create a minimal schema to allow builds to continue
    "type Query { _placeholder: String }" | Out-File -FilePath $SchemaFile -Encoding utf8
    
    Write-Host "✓ Created placeholder schema at $SchemaFile" -ForegroundColor Green
    exit 0
} 