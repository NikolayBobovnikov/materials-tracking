# This script builds the frontend in a Docker container to ensure build consistency
# It can be used to verify that your local changes will build successfully in CI/CD

# Get the directory of the script
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectDir = Split-Path -Parent $ScriptDir

# Display info about the build
Write-Host "Starting Docker build for frontend..." -ForegroundColor Cyan
Write-Host "Project directory: $ProjectDir" -ForegroundColor Cyan

# Check if Docker is installed
try {
    $dockerVersion = docker --version
    Write-Host "Found Docker: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: Docker is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Docker and try again" -ForegroundColor Yellow
    exit 1
}

# Build the Docker image
Write-Host "Building Docker image..." -ForegroundColor Cyan
docker build -t frontend-build $ProjectDir

# Check if the build was successful
if ($LASTEXITCODE -eq 0) {
    Write-Host "Docker build completed successfully!" -ForegroundColor Green
    
    # Optionally run tests in the container
    $runTests = Read-Host "Do you want to run tests in the container? (y/n)"
    if ($runTests -eq "y" -or $runTests -eq "Y") {
        Write-Host "Running tests in Docker container..." -ForegroundColor Cyan
        docker run --rm frontend-build sh -c "cd /app && npm test -- --watchAll=false"
    }
    
    # Optionally serve the built app
    $serveApp = Read-Host "Do you want to serve the built app locally? (y/n)"
    if ($serveApp -eq "y" -or $serveApp -eq "Y") {
        Write-Host "Serving the built app on http://localhost:8080..." -ForegroundColor Cyan
        docker run --rm -p 8080:80 frontend-build
        
        # Add note about stopping the container
        Write-Host "Press Ctrl+C to stop the container when finished" -ForegroundColor Yellow
    }
} else {
    Write-Host "Docker build failed" -ForegroundColor Red
    exit 1
} 