# simulate-docker-build.ps1
# Script to simulate the frontend Docker build process locally

# Default environment variables (similar to Docker args/env)
$env:GENERATE_SCHEMA = $true # Simulate Docker build arg
$env:NODE_ENV = "production" # Set Node environment
$env:BACKEND_URL = "http://localhost:5000" # Backend API URL
$env:PUBLIC_URL = "" # Public URL path

# Set working directories
$ROOT_DIR = Get-Location
$BACKEND_DIR = Join-Path $ROOT_DIR "backend"
$FRONTEND_DIR = Join-Path $ROOT_DIR "frontend"
$TEMP_DIR = Join-Path $ROOT_DIR "temp_build"

Write-Host "🔨 Simulating Docker frontend build process..." -ForegroundColor Cyan
Write-Host "Environment: NODE_ENV=$env:NODE_ENV, BACKEND_URL=$env:BACKEND_URL" -ForegroundColor Cyan

# Create temporary build directory (clean start)
if (Test-Path $TEMP_DIR) {
    Write-Host "Cleaning previous build directory..." -ForegroundColor Yellow
    Remove-Item -Path $TEMP_DIR -Recurse -Force
}
New-Item -Path $TEMP_DIR -ItemType Directory | Out-Null

# Copy frontend files to temp directory (fixed copy method)
Write-Host "📋 Copying frontend files..." -ForegroundColor Yellow
Get-ChildItem -Path $FRONTEND_DIR -Exclude "node_modules","build" | ForEach-Object {
    if ($_.PSIsContainer) {
        Copy-Item -Path $_.FullName -Destination (Join-Path $TEMP_DIR $_.Name) -Recurse -Force
    } else {
        Copy-Item -Path $_.FullName -Destination $TEMP_DIR -Force
    }
}

# Generate schema like in Docker build
if ($env:GENERATE_SCHEMA -eq $true) {
    Write-Host "🔄 Generating GraphQL schema from backend..." -ForegroundColor Yellow
    Push-Location $BACKEND_DIR
    try {
        python generate_schema.py
        if ($LASTEXITCODE -ne 0) {
            Write-Host "⚠️ Schema generation failed, but continuing with build..." -ForegroundColor Red
        } else {
            Write-Host "✅ Schema generated successfully" -ForegroundColor Green
        }
    } catch {
        Write-Host "⚠️ Error generating schema: $_" -ForegroundColor Red
        Write-Host "⚠️ Continuing with existing schema" -ForegroundColor Yellow
    }
    Pop-Location
} else {
    Write-Host "⏩ Skipping schema generation (GENERATE_SCHEMA=false)" -ForegroundColor Yellow
}

# Build frontend
Write-Host "🏗️ Building frontend..." -ForegroundColor Yellow
Push-Location $FRONTEND_DIR
try {
    # Type checking
    Write-Host "Running type checking..." -ForegroundColor Yellow
    npm run type-check-all
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Type checking failed" -ForegroundColor Red
        exit 1
    }
    
    # Linting
    Write-Host "Running linting..." -ForegroundColor Yellow
    npm run lint
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Linting failed" -ForegroundColor Red
        exit 1
    }
    
    # Relay compilation
    Write-Host "Running Relay compiler..." -ForegroundColor Yellow
    npm run relay
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Relay compilation failed" -ForegroundColor Red
        exit 1
    }
    
    # Build
    Write-Host "Running build..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error during build: $_" -ForegroundColor Red
    exit 1
}
Pop-Location

Write-Host "✅ Build simulation completed successfully" -ForegroundColor Green
Write-Host "The build output is in $FRONTEND_DIR\build" -ForegroundColor Cyan