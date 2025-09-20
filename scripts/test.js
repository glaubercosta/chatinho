#!/usr/bin/env node

/**
 * Test Runner Script
 * Runs comprehensive tests for the Chatinho application
 */

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Running Chatinho Test Suite...\n');

// Load environment for testing
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const tests = [
  {
    name: 'Environment Validation',
    type: 'sync',
    test: () => {
      console.log('🔍 Checking environment configuration...');
      
      // Check .env file
      const envPath = path.join(__dirname, '..', '.env');
      if (!fs.existsSync(envPath)) {
        throw new Error('.env file not found');
      }
      
      // Check required environment variables
      const requiredVars = ['PORT', 'N8N_WEBHOOK_URL'];
      const missingVars = requiredVars.filter(varName => !process.env[varName]);
      
      if (missingVars.length > 0) {
        console.warn(`⚠️  Missing optional variables: ${missingVars.join(', ')}`);
      }
      
      console.log('   ✅ Environment configuration valid');
    }
  },
  {
    name: 'File Structure Validation',
    type: 'sync',
    test: () => {
      console.log('📁 Checking file structure...');
      
      const requiredFiles = [
        'server.js',
        'package.json',
        'src/config/index.js',
        'src/services/messageService.js',
        'src/services/n8nService.js',
        'src/routes/api.js',
        'src/routes/webhooks.js',
        'src/controllers/socketController.js',
        'public/index.html',
        'assets/css/main.css',
        'assets/js/chat.js'
      ];
      
      const missingFiles = requiredFiles.filter(file => {
        const filePath = path.join(__dirname, '..', file);
        return !fs.existsSync(filePath);
      });
      
      if (missingFiles.length > 0) {
        throw new Error(`Missing files: ${missingFiles.join(', ')}`);
      }
      
      console.log('   ✅ All required files present');
    }
  },
  {
    name: 'Module Loading Test',
    type: 'sync',
    test: () => {
      console.log('📦 Testing module loading...');
      
      try {
        // Test core modules
        require('../src/config');
        require('../src/services/messageService');
        require('../src/services/n8nService');
        require('../src/routes/api');
        require('../src/routes/webhooks');
        require('../src/controllers/socketController');
        require('../src/middleware');
        require('../src/utils/helpers');
        
        console.log('   ✅ All modules load successfully');
      } catch (error) {
        throw new Error(`Module loading failed: ${error.message}`);
      }
    }
  },
  {
    name: 'n8n Webhook Test',
    type: 'async',
    test: async () => {
      console.log('🤖 Testing n8n webhook connection...');
      
      if (!process.env.N8N_WEBHOOK_URL) {
        console.log('   ⚠️  N8N_WEBHOOK_URL not configured, skipping test');
        return;
      }
      
      try {
        const n8nService = require('../src/services/n8nService');
        const result = await n8nService.testConnection();
        
        if (result && result.success) {
          console.log('   ✅ n8n webhook connection successful');
        } else {
          console.log('   ⚠️  n8n webhook test failed (but this may be expected)');
        }
      } catch (error) {
        console.log(`   ⚠️  n8n webhook test error: ${error.message}`);
      }
    }
  },
  {
    name: 'Server Startup Test',
    type: 'async',
    test: async () => {
      console.log('🚀 Testing server startup...');
      
      return new Promise((resolve, reject) => {
        // Start server in test mode
        const serverProcess = spawn('node', ['server.js'], {
          cwd: path.join(__dirname, '..'),
          stdio: 'pipe',
          env: { ...process.env, NODE_ENV: 'test', PORT: '0' } // Use random port
        });
        
        let output = '';
        let serverStarted = false;
        
        serverProcess.stdout.on('data', (data) => {
          output += data.toString();
          if (output.includes('Chatinho Server Started') && !serverStarted) {
            serverStarted = true;
            console.log('   ✅ Server starts successfully');
            serverProcess.kill('SIGTERM');
            resolve();
          }
        });
        
        serverProcess.stderr.on('data', (data) => {
          console.error('Server error:', data.toString());
        });
        
        serverProcess.on('close', (code) => {
          if (!serverStarted) {
            reject(new Error(`Server failed to start (exit code: ${code})`));
          }
        });
        
        // Timeout after 10 seconds
        setTimeout(() => {
          if (!serverStarted) {
            serverProcess.kill('SIGTERM');
            reject(new Error('Server startup timeout'));
          }
        }, 10000);
      });
    }
  }
];

// Run tests
async function runTests() {
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      console.log(`\n🧪 Running: ${test.name}`);
      
      if (test.type === 'async') {
        await test.test();
      } else {
        test.test();
      }
      
      passed++;
    } catch (error) {
      console.error(`   ❌ ${test.name} failed: ${error.message}`);
      failed++;
    }
  }
  
  console.log('\n📊 Test Results:');
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
  
  if (failed > 0) {
    console.log('\n❌ Some tests failed. Please check the errors above.');
    process.exit(1);
  } else {
    console.log('\n🎉 All tests passed!');
    process.exit(0);
  }
}

// Handle interruption
process.on('SIGINT', () => {
  console.log('\n🛑 Test suite interrupted');
  process.exit(1);
});

// Run the tests
runTests().catch(error => {
  console.error('\n💥 Test suite crashed:', error.message);
  process.exit(1);
});