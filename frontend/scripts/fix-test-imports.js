#!/usr/bin/env node

/**
 * This script fixes imports in the type test files by removing the .ts extension
 * from imports, which causes TypeScript errors during build.
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

// Get the list of files to fix
const typeTestsDir = path.join(__dirname, '..', 'src', '__type_tests__');

if (!fs.existsSync(typeTestsDir)) {
  console.log('🔍 No __type_tests__ directory found. Nothing to fix.');
  process.exit(0);
}

// Get all test files in the directory
const files = fs.readdirSync(typeTestsDir)
  .filter(file => file.endsWith('.ts') || file.endsWith('.tsx'));

if (files.length === 0) {
  console.log('🔍 No test files found in __type_tests__ directory. Nothing to fix.');
  process.exit(0);
}

console.log(`🔧 Found ${files.length} test files to fix.`);

// Process each file
let fixedCount = 0;
for (const file of files) {
  const filePath = path.join(typeTestsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix the imports by removing the .ts extension
  const fixedContent = content.replace(/\.graphql\.ts(['"])/g, '.graphql$1');
  
  if (content !== fixedContent) {
    fs.writeFileSync(filePath, fixedContent);
    console.log(`✅ Fixed imports in ${file}`);
    fixedCount++;
  } else {
    console.log(`ℹ️ No changes needed in ${file}`);
  }
}

console.log(`\n🎉 Fixed imports in ${fixedCount} files.`);

// Run the build again to see if fixes worked
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