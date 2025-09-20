/**
 * Test Mocks and Fixtures
 * Following TDD methodology - Test data isolation
 */

const nock = require('nock');

class TestMocks {
  constructor() {
    this.n8nBaseUrl = 'http://localhost:5678';
    this.testWebhookPath = '/webhook/test';
  }

  /**
   * Mock successful n8n webhook response
   */
  mockN8nSuccess(responseMessage = 'Success response from n8n') {
    return nock(this.n8nBaseUrl)
      .post(this.testWebhookPath)
      .reply(200, { output: responseMessage });
  }

  /**
   * Mock n8n webhook server error
   */
  mockN8nServerError() {
    return nock(this.n8nBaseUrl)
      .post(this.testWebhookPath)
      .reply(500, 'Internal Server Error');
  }

  /**
   * Mock n8n webhook network error
   */
  mockN8nNetworkError() {
    return nock(this.n8nBaseUrl)
      .post(this.testWebhookPath)
      .replyWithError('Network connection failed');
  }

  /**
   * Mock n8n webhook timeout
   */
  mockN8nTimeout() {
    return nock(this.n8nBaseUrl)
      .post(this.testWebhookPath)
      .delay(35000) // Longer than typical timeout
      .reply(200, { output: 'Delayed response' });
  }

  /**
   * Mock n8n webhook with custom response
   */
  mockN8nCustomResponse(statusCode, response) {
    return nock(this.n8nBaseUrl)
      .post(this.testWebhookPath)
      .reply(statusCode, response);
  }

  /**
   * Mock n8n webhook with request validation
   */
  mockN8nWithValidation(expectedPayload, response = { output: 'Validated response' }) {
    return nock(this.n8nBaseUrl)
      .post(this.testWebhookPath, expectedPayload)
      .reply(200, response);
  }

  /**
   * Clear all mocks
   */
  clearAll() {
    nock.cleanAll();
  }

  /**
   * Get pending mocks (for debugging)
   */
  getPendingMocks() {
    return nock.pendingMocks();
  }
}

class TestFixtures {
  /**
   * Sample message objects for testing
   */
  static get sampleMessages() {
    return {
      valid: {
        text: 'This is a valid test message',
        sender: 'Test User',
        sendToN8n: false
      },
      withN8n: {
        text: 'Message that should go to n8n',
        sender: 'N8N Test User',
        sendToN8n: true
      },
      system: {
        text: 'System notification message',
        sender: 'System',
        type: 'system_notification'
      },
      webhook: {
        message: 'Message from webhook',
        sender: 'External Service'
      },
      empty: {
        text: '',
        sender: 'Empty Message User',
        sendToN8n: false
      },
      noSender: {
        text: 'Message without sender',
        sendToN8n: false
      },
      longMessage: {
        text: 'A'.repeat(5000), // Very long message
        sender: 'Long Message User',
        sendToN8n: false
      },
      specialChars: {
        text: 'Message with special chars: åäöüß 中文 العربية 🚀🎉',
        sender: 'Unicode Test User',
        sendToN8n: false
      },
      html: {
        text: '<script>alert("xss")</script>Safe message',
        sender: 'Security Test User',
        sendToN8n: false
      }
    };
  }

  /**
   * Sample webhook payloads
   */
  static get webhookPayloads() {
    return {
      n8n: {
        message: 'Message from n8n workflow',
        sender: 'n8n Automation'
      },
      generic: {
        message: 'Generic webhook message',
        sender: 'External System',
        timestamp: new Date().toISOString()
      },
      system: {
        message: 'System maintenance notification',
        type: 'system_notification',
        priority: 'high'
      },
      invalid: {
        // Missing required fields
        invalidField: 'invalid data'
      },
      malformed: 'This should be an object, not a string'
    };
  }

  /**
   * Sample API responses
   */
  static get apiResponses() {
    return {
      health: {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '1.0.0'
      },
      messages: {
        messages: [
          {
            id: '1',
            text: 'First message',
            sender: 'User 1',
            timestamp: '2024-01-01T10:00:00.000Z',
            source: 'client'
          },
          {
            id: '2',
            text: 'Second message',
            sender: 'User 2',
            timestamp: '2024-01-01T10:01:00.000Z',
            source: 'client'
          }
        ],
        count: 2
      },
      emptyMessages: {
        messages: [],
        count: 0
      }
    };
  }

  /**
   * Sample error responses
   */
  static get errorResponses() {
    return {
      validation: {
        error: 'Validation Error',
        message: 'Invalid message format',
        code: 'VALIDATION_ERROR'
      },
      notFound: {
        error: 'Not Found',
        message: 'Resource not found',
        code: 'NOT_FOUND'
      },
      serverError: {
        error: 'Internal Server Error',
        message: 'Something went wrong',
        code: 'INTERNAL_ERROR'
      },
      unauthorized: {
        error: 'Unauthorized',
        message: 'Invalid API key',
        code: 'UNAUTHORIZED'
      }
    };
  }

  /**
   * Generate test message with timestamp
   */
  static createTestMessage(overrides = {}) {
    return {
      id: `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: 'Test message',
      sender: 'Test User',
      timestamp: new Date().toISOString(),
      source: 'client',
      ...overrides
    };
  }

  /**
   * Generate multiple test messages
   */
  static createTestMessages(count = 5, overrides = {}) {
    return Array.from({ length: count }, (_, index) => 
      this.createTestMessage({
        text: `Test message ${index + 1}`,
        sender: `Test User ${index + 1}`,
        ...overrides
      })
    );
  }

  /**
   * Create test socket client configuration
   */
  static get socketClientConfig() {
    return {
      transports: ['websocket'],
      forceNew: true,
      reconnection: false,
      timeout: 5000
    };
  }

  /**
   * Create test server configuration
   */
  static get serverConfig() {
    return {
      port: 3010 + Math.floor(Math.random() * 100), // Random test port
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000
    };
  }
}

/**
 * Test Database Mock
 * Simulates database operations for testing
 */
class TestDatabase {
  constructor() {
    this.messages = [];
    this.users = [];
    this.sessions = [];
  }

  // Message operations
  addMessage(message) {
    const messageWithId = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...message
    };
    this.messages.push(messageWithId);
    return messageWithId;
  }

  getMessages(limit = 100) {
    return this.messages.slice(-limit);
  }

  getMessageById(id) {
    return this.messages.find(msg => msg.id === id);
  }

  clearMessages() {
    this.messages = [];
  }

  // User operations
  addUser(user) {
    const userWithId = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      ...user
    };
    this.users.push(userWithId);
    return userWithId;
  }

  getUsers() {
    return this.users;
  }

  clearUsers() {
    this.users = [];
  }

  // Session operations
  addSession(session) {
    const sessionWithId = {
      id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      ...session
    };
    this.sessions.push(sessionWithId);
    return sessionWithId;
  }

  getSessions() {
    return this.sessions;
  }

  clearSessions() {
    this.sessions = [];
  }

  // Clear all data
  clearAll() {
    this.clearMessages();
    this.clearUsers();
    this.clearSessions();
  }
}

/**
 * Test Utilities
 */
class TestUtils {
  /**
   * Wait for a specified amount of time
   */
  static wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Wait for a condition to be true
   */
  static async waitFor(condition, timeout = 5000, interval = 100) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      if (await condition()) {
        return true;
      }
      await this.wait(interval);
    }
    throw new Error(`Condition not met within ${timeout}ms`);
  }

  /**
   * Generate random string
   */
  static randomString(length = 10) {
    return Math.random().toString(36).substring(2, length + 2);
  }

  /**
   * Generate random email
   */
  static randomEmail() {
    return `test-${this.randomString()}@example.com`;
  }

  /**
   * Validate message format
   */
  static isValidMessage(message) {
    return (
      message &&
      typeof message === 'object' &&
      typeof message.text === 'string' &&
      message.text.trim().length > 0 &&
      typeof message.sender === 'string' &&
      message.sender.trim().length > 0
    );
  }

  /**
   * Deep clone object
   */
  static deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Create test environment variables
   */
  static setTestEnv() {
    process.env.NODE_ENV = 'test';
    process.env.PORT = '3010';
    process.env.N8N_WEBHOOK_URL = 'http://localhost:5678/webhook/test';
    process.env.ADMIN_API_KEY = 'test-admin-key';
  }

  /**
   * Restore original environment
   */
  static restoreEnv() {
    delete process.env.NODE_ENV;
    delete process.env.PORT;
    delete process.env.N8N_WEBHOOK_URL;
    delete process.env.ADMIN_API_KEY;
  }
}

module.exports = {
  TestMocks,
  TestFixtures,
  TestDatabase,
  TestUtils
};