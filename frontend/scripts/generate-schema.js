#!/usr/bin/env node
/**
 * Simple schema generation script that calls the backend Python script
 * Works in both local development and Docker environments
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const FRONTEND_DIR = path.resolve(__dirname, '..');
const PROJECT_ROOT = path.resolve(FRONTEND_DIR, '..');
const SCHEMA_FILE = path.join(FRONTEND_DIR, 'schema.graphql');
const VERBOSE = process.env.VERBOSE === 'true';

// Determine if we're in Docker
const isDocker = fs.existsSync('/.dockerenv');

// Potential backend locations (in order of preference)
const BACKEND_PATHS = isDocker
  ? ['/backend_mount', '/backend', path.join(PROJECT_ROOT, 'backend')]
  : [path.join(PROJECT_ROOT, 'backend')];

// Simple logging utilities
const log = {
  info: (message) => console.log(message),
  success: (message) => console.log(`✅ ${message}`),
  warning: (message) => console.log(`⚠️ ${message}`),
  error: (message) => console.error(`❌ ${message}`),
  debug: (message) => VERBOSE && console.log(`🔍 ${message}`)
};

/**
 * Gets the appropriate Python command for the current environment
 * @returns {string|null} Python command or null if not available
 */
function getPythonCommand() {
  try {
    execSync('python3 --version', { stdio: 'ignore' });
    return 'python3';
  } catch (e) {
    try {
      execSync('python --version', { stdio: 'ignore' });
      return 'python';
    } catch (e2) {
      return null;
    }
  }
}

/**
 * Generate schema by running Python script
 */
function generateSchema() {
  log.info(`Generating GraphQL schema for ${isDocker ? 'Docker' : 'Local'} environment...`);
  
  // Get Python command
  const pythonCmd = getPythonCommand();
  if (!pythonCmd) {
    log.error('Python not found. Please install Python 3.x');
    return false;
  }
  
  // Find backend
  let backendPath = null;
  for (const path of BACKEND_PATHS) {
    if (fs.existsSync(path)) {
      backendPath = path;
      break;
    }
  }
  
  if (!backendPath) {
    log.error('Backend directory not found');
    return false;
  }
  
  log.debug(`Found backend at ${backendPath}`);
  const generateScriptPath = path.join(backendPath, 'generate_schema.py');
  
  if (!fs.existsSync(generateScriptPath)) {
    log.error(`generate_schema.py not found in ${backendPath}`);
    return false;
  }
  
  // Save current directory
  const currentDir = process.cwd();
  
  try {
    // Change to backend directory
    process.chdir(backendPath);
    log.info(`Running ${pythonCmd} generate_schema.py`);
    
    // Run Python script
    const stdio = VERBOSE ? 'inherit' : 'pipe';
    const output = execSync(`${pythonCmd} generate_schema.py`, { encoding: 'utf8', stdio });
    if (VERBOSE) {
      log.debug(output);
    }
    
    // Check if schema was generated
    if (fs.existsSync(SCHEMA_FILE)) {
      log.success('Schema generated successfully');
      return true;
    } else {
      log.error('Schema file was not created');
      return false;
    }
  } catch (error) {
    log.error(`Failed to generate schema: ${error.message}`);
    return false;
  } finally {
    // Always restore original directory
    process.chdir(currentDir);
  }
}

// Run the script
try {
  const success = generateSchema();
  process.exit(success ? 0 : 1);
} catch (error) {
  log.error(`Unhandled error: ${error.message}`);
  process.exit(1);
} 