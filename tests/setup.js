/**
 * Jest Test Setup Configuration
 * Following TDD methodology
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '3003';
process.env.N8N_WEBHOOK_URL = 'http://localhost:5678/webhook/test';
process.env.ADMIN_API_KEY = 'test-admin-key';
process.env.MAX_MESSAGES = '100';
process.env.MESSAGE_RETENTION_HOURS = '1';

// Import test helpers
const { TestMocks, TestFixtures, TestDatabase, TestUtils } = require('./helpers/testHelpers');
const nock = require('nock');

// Increase test timeout for integration tests
jest.setTimeout(10000);

// Make nock available globally
global.nock = nock;

// Global test utilities and helpers
global.testConfig = {
  port: 3003,
  n8nUrl: 'http://localhost:5678/webhook/test',
  adminKey: 'test-admin-key'
};

global.testUtils = TestUtils;
global.testMocks = new TestMocks();
global.testFixtures = TestFixtures;
global.testDatabase = new TestDatabase();

// Force cleanup after tests
const originalProcessExit = process.exit;
process.exit = (code) => {
  const nock = require('nock');
  nock.cleanAll();
  nock.restore();
  originalProcessExit(code);
};

// Mock console methods for cleaner test output
const originalConsole = console;

beforeAll(() => {
  global.console = {
    ...originalConsole,
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn()
  };
});

afterAll(() => {
  global.console = originalConsole;
});

// Global setup for each test
beforeEach(() => {
  // Clear all mocks
  if (global.testMocks) {
    global.testMocks.clearAll();
  }
  
  // Clear test database
  if (global.testDatabase) {
    global.testDatabase.clearAll();
  }
});

// Global cleanup after each test
afterEach(() => {
  // Clear all mocks
  if (global.testMocks) {
    global.testMocks.clearAll();
  }
});

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});