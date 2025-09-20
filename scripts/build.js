#!/usr/bin/env node

/**
 * Production Build and Deployment Script
 * Prepares the application for production deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🏗️  Building Chatinho for Production...\n');

// Step 1: Clean and prepare
console.log('1️⃣ Cleaning and preparing...');
try {
  // Remove development files
  const devFiles = ['nodemon.json', '.env.local'];
  devFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`   ✅ Removed ${file}`);
    }
  });
} catch (error) {
  console.error('❌ Error during cleanup:', error.message);
}

// Step 2: Install production dependencies
console.log('\n2️⃣ Installing production dependencies...');
try {
  execSync('npm ci --only=production', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
  console.log('   ✅ Dependencies installed');
} catch (error) {
  console.error('❌ Error installing dependencies:', error.message);
  process.exit(1);
}

// Step 3: Validate required files
console.log('\n3️⃣ Validating production files...');
const requiredFiles = [
  'server.js',
  'package.json',
  '.env.example',
  'public/index.html',
  'assets/css/main.css',
  'assets/js/chat.js'
];

let allFilesPresent = true;
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - MISSING`);
    allFilesPresent = false;
  }
});

if (!allFilesPresent) {
  console.error('\n❌ Some required files are missing!');
  process.exit(1);
}

// Step 4: Create production environment template
console.log('\n4️⃣ Creating production environment template...');
const prodEnvContent = `# Production Environment Configuration
NODE_ENV=production
PORT=3000

# n8n Webhook Configuration
N8N_WEBHOOK_URL=

# Security
ADMIN_KEY=

# Optional: Database Configuration (for future use)
# DATABASE_URL=
`;

fs.writeFileSync(
  path.join(__dirname, '..', '.env.production.example'),
  prodEnvContent
);
console.log('   ✅ Created .env.production.example');

// Step 5: Create deployment package info
console.log('\n5️⃣ Creating deployment information...');
const deploymentInfo = {
  buildTime: new Date().toISOString(),
  nodeVersion: process.version,
  dependencies: require('../package.json').dependencies,
  requiredEnvironmentVariables: [
    'NODE_ENV',
    'PORT',
    'N8N_WEBHOOK_URL'
  ],
  healthCheckEndpoint: '/api/health',
  deploymentNotes: [
    'Ensure N8N_WEBHOOK_URL is configured',
    'Set NODE_ENV=production',
    'Configure ADMIN_KEY for admin endpoints',
    'Verify port is available and accessible'
  ]
};

fs.writeFileSync(
  path.join(__dirname, '..', 'deployment-info.json'),
  JSON.stringify(deploymentInfo, null, 2)
);
console.log('   ✅ Created deployment-info.json');

console.log('\n🎉 Production build completed successfully!');
console.log('\n📋 Next steps for deployment:');
console.log('   1. Copy files to production server');
console.log('   2. Create .env file with production values');
console.log('   3. Run: npm start');
console.log('   4. Verify health check: GET /api/health');
console.log('\n🔗 Helpful endpoints:');
console.log('   Health Check: GET /api/health');
console.log('   n8n Test: GET /api/test-n8n');
console.log('   Statistics: GET /api/stats');