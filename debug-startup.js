// Debug script to test application startup components
require('dotenv').config();
const fs = require('fs');
const path = require('path');

console.log('=== DEBUG STARTUP SCRIPT ===');
console.log('Current working directory:', process.cwd());
console.log('Node version:', process.version);

// Check environment variables
console.log('\n=== ENVIRONMENT VARIABLES ===');
console.log('REACT_APP_SUPABASE_URL:', process.env.REACT_APP_SUPABASE_URL ? '✅ Set' : '❌ Not set');
console.log('REACT_APP_SUPABASE_ANON_KEY:', process.env.REACT_APP_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not set');
console.log('REACT_APP_RESEND_API_KEY:', process.env.REACT_APP_RESEND_API_KEY ? '✅ Set' : '❌ Not set');
console.log('REACT_APP_EMAIL_FROM:', process.env.REACT_APP_EMAIL_FROM ? '✅ Set' : '❌ Not set');

// Check package.json
console.log('\n=== PACKAGE.JSON ===');
try {
  const packageJson = require('./package.json');
  console.log('Name:', packageJson.name);
  console.log('Main script:', packageJson.main);
  console.log('Start script:', packageJson.scripts.start);
  console.log('Dependencies:', Object.keys(packageJson.dependencies).length);
} catch (error) {
  console.error('Error reading package.json:', error.message);
}

// Check critical files
console.log('\n=== CRITICAL FILES ===');
const criticalFiles = [
  './src/index.js',
  './src/App.js',
  './src/services/EmailService.js',
  './craco.config.js',
  './config-overrides.js'
];

criticalFiles.forEach(file => {
  try {
    const stats = fs.statSync(file);
    console.log(`${file}: ✅ Exists (${stats.size} bytes)`);
  } catch (error) {
    console.log(`${file}: ❌ ${error.message}`);
  }
});

// Try to import and test the EmailService
console.log('\n=== TESTING EMAIL SERVICE ===');
try {
  // Mock window object for testing
  global.window = {
    location: {
      origin: 'http://localhost:3000'
    }
  };
  
  // Don't try to directly require the EmailService as it uses ES modules
  console.log('Skipping direct import of EmailService as it uses ES modules');
  console.log('This is expected behavior - React will handle this properly');
} catch (error) {
  console.error('Error testing EmailService:', error);
}

// Check for potential port conflicts
console.log('\n=== CHECKING PORT CONFLICTS ===');
const { execSync } = require('child_process');
try {
  const result = execSync('netstat -ano | findstr ":3000"').toString();
  console.log('Processes using port 3000:');
  console.log(result);
} catch (error) {
  console.log('No processes found using port 3000');
}

console.log('\n=== DEBUG COMPLETE ===');
