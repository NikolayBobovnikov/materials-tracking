#!/usr/bin/env node

/**
 * Advanced type checking script that checks both source code and generated code
 * Useful to catch discrepancies between local and CI environments
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Utility function to run a command and check its exit code
function runCommand(command, args = [], options = {}) {
  console.log(`\n> ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, { 
    stdio: 'inherit', 
    shell: process.platform === 'win32',
    ...options 
  });

  if (result.status !== 0) {
    console.error(`\n❌ Command failed with status ${result.status}`);
    process.exit(result.status);
  }

  return result;
}

// Create temporary test files in a temporary directory
function createTypeTestFiles() {
  // Create files in the system's temp directory instead of the project
  const testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'relay-type-tests-'));
  const generatedDir = path.join(__dirname, '..', 'src', '__generated__');
  
  // Get all generated GraphQL files
  const files = fs.readdirSync(generatedDir)
    .filter(file => file.endsWith('.graphql.ts'));
  
  const testFiles = [];
  
  for (const file of files) {
    const baseName = path.basename(file, '.graphql.ts');
    const importPath = path.join(
      path.relative(testDir, path.join(__dirname, '..')), 
      'src', '__generated__', file.replace('.ts', '')
    );
    
    // Create a test file that imports and uses the types
    const testContent = `
// Auto-generated test file for ${baseName}
import type { ${baseName} } from '${importPath.replace(/\\/g, '/')}';

// Test that we can use the response property
type TestResponseType = ${baseName}['response'];

// Verify structure matches what components expect
const testFunc = (data: TestResponseType): void => {
  console.log(data);
};

export default testFunc;
`;
    
    const testFilePath = path.join(testDir, `${baseName}.test.ts`);
    fs.writeFileSync(testFilePath, testContent);
    testFiles.push(testFilePath);
  }
  
  return { testDir, testFiles };
}

// Clean up test files
function cleanupTestFiles(testDir) {
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true, force: true });
  }
}

// Ensure imports in test files use correct format
function fixTestImportPaths() {
  console.log('\n🔧 Checking for any test files with incorrect import paths...');
  // Invoke the fix-test-imports script
  runCommand('node', [path.join(__dirname, 'fix-test-imports.js')]);
}

// Main function
function main() {
  console.log('🔍 Running enhanced type checking...');
  
  // Run the normal type checking first
  runCommand('npx', ['tsc', '--noEmit']);
  
  // Create test files for generated types
  console.log('\n🧪 Creating type test files for generated GraphQL types...');
  const { testDir, testFiles } = createTypeTestFiles();
  
  try {
    // Run type checking on each test file individually
    console.log('\n🔎 Type checking generated GraphQL types...');
    
    for (const testFile of testFiles) {
      runCommand('npx', ['tsc', '--noEmit', testFile]);
    }
    
    console.log('\n✅ All type checks passed!');
  } finally {
    // Clean up test files
    cleanupTestFiles(testDir);
  }

  // Run fix-test-imports to ensure any project test files have correct imports
  fixTestImportPaths();
}

main(); 