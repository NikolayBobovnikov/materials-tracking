#!/usr/bin/env node
/**
 * Cross-platform schema generation script
 * Works on Windows, macOS, Linux, and Docker
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const FRONTEND_DIR = path.resolve(__dirname, '..');
const PROJECT_ROOT = path.resolve(FRONTEND_DIR, '..');
const SCHEMA_FILE = path.join(FRONTEND_DIR, 'schema.graphql');
const PLACEHOLDER_SCHEMA = 'type Query { _placeholder: String }';

// Potential backend locations (in order of preference)
const BACKEND_LOCATIONS = [
  // Docker-specific paths
  '/backend_mount',
  '/backend',
  // Relative paths that work locally and in various configurations
  path.join(PROJECT_ROOT, 'backend'),
  path.join(FRONTEND_DIR, '..', 'backend'),
  '../backend'
];

// Determine if we're in Docker
const isDocker = fs.existsSync('/.dockerenv') || 
                (process.env.DOCKER_CONTAINER === 'true') ||
                (process.env.RUNNING_IN_DOCKER === 'true');

// Check if Python command is python or python3
function getPythonCommand() {
  try {
    execSync('python3 --version', { stdio: 'ignore' });
    return 'python3';
  } catch (e) {
    try {
      execSync('python --version', { stdio: 'ignore' });
      return 'python';
    } catch (e2) {
      console.error('❌ Error: Neither python nor python3 command is available');
      return null;
    }
  }
}

// Main function
function generateSchema() {
  console.log(`🔍 Running schema generation (${isDocker ? 'Docker' : 'Local'} environment)...`);

  const pythonCmd = getPythonCommand();
  if (!pythonCmd) {
    handleMissingBackend();
    return;
  }

  // Try each backend location
  for (const backendPath of BACKEND_LOCATIONS) {
    const schemaGeneratorPath = path.join(backendPath, 'generate_schema.py');
    
    try {
      if (fs.existsSync(schemaGeneratorPath)) {
        console.log(`✅ Found backend at ${backendPath}`);
        
        // Save current directory
        const currentDir = process.cwd();
        
        // Change to backend directory
        process.chdir(backendPath);
        
        try {
          // Run Python script
          console.log(`🐍 Running ${pythonCmd} generate_schema.py`);
          execSync(`${pythonCmd} generate_schema.py`, { stdio: 'inherit' });
          
          console.log('✅ Schema generated successfully');
          // Restore original directory
          process.chdir(currentDir);
          return true;
        } catch (e) {
          console.error(`❌ Schema generation failed: ${e.message}`);
          // Restore original directory
          process.chdir(currentDir);
          
          if (isDocker) {
            // In Docker, try the next location instead of failing
            continue;
          } else {
            // In development, fail with error
            process.exit(1);
          }
        }
      }
    } catch (e) {
      // Path doesn't exist or can't be accessed, try next
      continue;
    }
  }

  // If we get here, no backend was found
  handleMissingBackend();
}

function handleMissingBackend() {
  console.warn('⚠️ Warning: No backend found with generate_schema.py');
  
  if (fs.existsSync(SCHEMA_FILE)) {
    console.log('📄 Using existing schema.graphql');
    return true;
  } else {
    console.warn('⚠️ No schema found and no backend available');
    console.log('📝 Creating minimal placeholder schema');
    
    try {
      fs.writeFileSync(SCHEMA_FILE, PLACEHOLDER_SCHEMA, 'utf8');
      console.log(`✅ Created placeholder schema at ${SCHEMA_FILE}`);
      return true;
    } catch (e) {
      console.error(`❌ Failed to create placeholder schema: ${e.message}`);
      process.exit(1);
    }
  }
}

// Run the script
generateSchema(); 