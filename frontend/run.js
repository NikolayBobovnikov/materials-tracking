const { execSync } = require('child_process');

function main() {
  console.log('Starting React development server...');
  
  try {
    execSync('npm start', { stdio: 'inherit' });
  } catch (error) {
    console.error(`Failed to start development server: ${error}`);
    process.exit(1);
  }
}

main(); 