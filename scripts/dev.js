#!/usr/bin/env node

/**
 * Development Server Startup Script
 * Enhanced startup with environment validation and health checks
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Chatinho Development Server...\n');

// Validate environment
console.log('🔍 Validating environment...');

// Check if .env exists
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.warn('⚠️  .env file not found, copying from .env.example');
  const examplePath = path.join(__dirname, '..', '.env.example');
  if (fs.existsSync(examplePath)) {
    fs.copyFileSync(examplePath, envPath);
    console.log('✅ .env file created');
  } else {
    console.error('❌ .env.example not found!');
    process.exit(1);
  }
}

// Load environment variables
require('dotenv').config({ path: envPath });

// Check required environment variables
const requiredVars = ['PORT', 'N8N_WEBHOOK_URL'];
const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.warn(`⚠️  Missing environment variables: ${missingVars.join(', ')}`);
  console.log('📝 Please configure these in your .env file');
}

// Display current configuration
console.log('⚙️  Current Configuration:');
console.log(`   PORT: ${process.env.PORT || 3000}`);
console.log(`   N8N_WEBHOOK_URL: ${process.env.N8N_WEBHOOK_URL || 'Not configured'}`);
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log('');

// Start the server
console.log('🎯 Starting server with nodemon...\n');

const serverProcess = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true,
  cwd: path.join(__dirname, '..')
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development server...');
  serverProcess.kill('SIGINT');
  process.exit(0);
});

serverProcess.on('close', (code) => {
  console.log(`\n🏁 Server exited with code ${code}`);
  process.exit(code);
});