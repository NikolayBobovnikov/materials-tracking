#!/usr/bin/env node
/**
 * Unified schema generation script that works across all environments
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

// Determine if we're in Docker
const isDocker = fs.existsSync('/.dockerenv');

// Potential backend locations (in order of preference)
const BACKEND_PATHS = isDocker
  ? ['/backend_mount', '/backend', path.join(PROJECT_ROOT, 'backend')]
  : [path.join(PROJECT_ROOT, 'backend')];

/**
 * Extracts schema directly from schema.py using regex
 * @param {string} schemaPath Path to schema.py
 * @returns {boolean} Success or failure
 */
function extractSchemaDirectly(schemaPath) {
  try {
    console.log(`📄 Extracting schema directly from ${schemaPath}`);
    const content = fs.readFileSync(schemaPath, 'utf8');
    const match = content.match(/type_defs\s*=\s*"""([\s\S]*?)"""/);
    
    if (match && match[1]) {
      fs.writeFileSync(SCHEMA_FILE, match[1], 'utf8');
      console.log('✅ Schema extracted successfully via direct extraction');
      return true;
    }
    
    console.error('❌ Could not find schema definition in schema.py');
    return false;
  } catch (error) {
    console.error(`❌ Error extracting schema: ${error.message}`);
    return false;
  }
}

/**
 * Runs the Python schema generator script
 * @param {string} backendPath Path to backend directory
 * @returns {boolean} Success or failure
 */
function runPythonGenerator(backendPath) {
  const generateScriptPath = path.join(backendPath, 'generate_schema.py');
  
  if (!fs.existsSync(generateScriptPath)) {
    return false;
  }
  
  try {
    // Try to determine Python command
    let pythonCmd = 'python3';
    try {
      execSync('python3 --version', { stdio: 'ignore' });
    } catch (e) {
      try {
        execSync('python --version', { stdio: 'ignore' });
        pythonCmd = 'python';
      } catch (e2) {
        console.error('❌ Neither python nor python3 command available');
        return false;
      }
    }
    
    console.log(`🐍 Running ${pythonCmd} generate_schema.py`);
    
    // Save current directory
    const currentDir = process.cwd();
    
    // Change to backend directory
    process.chdir(backendPath);
    
    // Run Python script
    const output = execSync(`${pythonCmd} generate_schema.py`, { encoding: 'utf8' });
    console.log(output);
    
    // Restore original directory
    process.chdir(currentDir);
    
    if (fs.existsSync(SCHEMA_FILE)) {
      console.log('✅ Schema generated successfully via Python script');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Python script error: ${error.message}`);
    return false;
  }
}

/**
 * Main function to generate schema
 */
function generateSchema() {
  console.log(`🔍 Generating GraphQL schema (${isDocker ? 'Docker' : 'Local'} environment)...`);
  
  // Try each backend path
  for (const backendPath of BACKEND_PATHS) {
    if (!fs.existsSync(backendPath)) {
      continue;
    }
    
    console.log(`📂 Found backend at ${backendPath}`);
    
    // Method 1: Try Python generator
    if (runPythonGenerator(backendPath)) {
      return true;
    }
    
    // Method 2: Try direct extraction
    const schemaPath = path.join(backendPath, 'schema.py');
    if (fs.existsSync(schemaPath) && extractSchemaDirectly(schemaPath)) {
      return true;
    }
  }
  
  // Check if schema already exists
  if (fs.existsSync(SCHEMA_FILE)) {
    console.log('📄 Using existing schema.graphql');
    return true;
  }
  
  // Create a placeholder schema as last resort
  console.log('⚠️ Creating minimal placeholder schema');
  fs.writeFileSync(SCHEMA_FILE, PLACEHOLDER_SCHEMA, 'utf8');
  return true;
}

// Run the script and handle exit codes
try {
  const success = generateSchema();
  process.exit(success ? 0 : 1);
} catch (error) {
  console.error(`❌ Unhandled error: ${error.message}`);
  process.exit(1);
} 