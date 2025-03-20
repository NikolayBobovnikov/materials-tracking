const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function runCommand(command) {
  console.log(`Running: ${command}`);
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Command failed with error: ${error}`);
    process.exit(1);
  }
}

function main() {
  console.log('Setting up frontend dependencies...');
  
  const forceInstall = process.argv.includes('--force');
  const packageJsonPath = path.join(__dirname, 'package.json');
  const nodeModulesPath = path.join(__dirname, 'node_modules');
  
  // Check if we should reinstall dependencies
  let shouldInstall = forceInstall;
  
  if (!shouldInstall) {
    // Check if node_modules exists
    if (!fs.existsSync(nodeModulesPath)) {
      console.log('Node modules directory not found. Installing dependencies...');
      shouldInstall = true;
    } else {
      // Check if package.json has been modified since last install
      const packageJsonStat = fs.statSync(packageJsonPath);
      const nodeModulesStat = fs.statSync(nodeModulesPath);
      
      if (packageJsonStat.mtimeMs > nodeModulesStat.mtimeMs) {
        console.log('Package.json has been modified. Reinstalling dependencies...');
        shouldInstall = true;
      }
    }
  }
  
  if (shouldInstall) {
    console.log('Installing dependencies...');
    runCommand('npm install');
  } else {
    console.log('Dependencies already installed. To force reinstall, run with --force flag or delete node_modules folder.');
  }
  
  console.log('Frontend setup completed successfully!');
}

main(); 