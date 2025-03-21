#!/usr/bin/env node

/**
 * This script fixes imports in test files by removing the .ts extension
 * from imports, which causes TypeScript errors during build.
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

// Function to recursively get all test files in a directory
function getAllTestFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Recursively get files from subdirectories, but skip node_modules and build
      if (file !== 'node_modules' && file !== 'build') {
        results = results.concat(getAllTestFiles(filePath));
      }
    } else if (
      (file.endsWith('.test.ts') || file.endsWith('.test.tsx')) && 
      !file.includes('setupTests')
    ) {
      results.push(filePath);
    }
  });
  
  return results;
}

// Get all test files in the src directory
console.log('🔍 Scanning for test files to fix import paths...');
const srcDir = path.join(__dirname, '..', 'src');
const testFiles = getAllTestFiles(srcDir);

if (testFiles.length === 0) {
  console.log('🔍 No test files found. Nothing to fix.');
  process.exit(0);
}

console.log(`🔧 Found ${testFiles.length} test files to check.`);

// Process each file
let fixedCount = 0;
for (const filePath of testFiles) {
  let content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(srcDir, filePath);
  
  // Fix the imports by removing the .ts extension
  // This pattern targets .graphql.ts, .tsx, and .ts extensions in imports
  const fixedContent = content
    .replace(/\.graphql\.ts(['"])/g, '.graphql$1')
    .replace(/(from\s+['"].*?)\.tsx?(['"])/g, '$1$2');
  
  if (content !== fixedContent) {
    fs.writeFileSync(filePath, fixedContent);
    console.log(`✅ Fixed imports in ${relativePath}`);
    fixedCount++;
  }
}

console.log(`\n🎉 Fixed imports in ${fixedCount} files.`);

// Run the build again to see if fixes worked
if (fixedCount > 0) {
  console.log('\n🏗️ Running TypeScript check to verify fixes...');
  try {
    const result = spawnSync('npx', ['tsc', '--noEmit'], { 
      stdio: 'inherit',
      shell: process.platform === 'win32'
    });
    
    if (result.status === 0) {
      console.log('\n✅ TypeScript check passed successfully!');
    } else {
      console.error('\n❌ TypeScript check still has errors. Please check the output above.');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Error running TypeScript check:', error);
    process.exit(1);
  }
} 