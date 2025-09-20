/**
 * API Integration Tests
 * Following TDD methodology
 */

const request = require('supertest');
const nock = require('nock');
const messageService = require('../../src/services/messageService');

// Mock n8n service
jest.mock('../../src/services/n8nService');

let app;
let server;

describe('API Integration Tests', () => {
  beforeAll(() => {
    // Setup test environment
    process.env.NODE_ENV = 'test';
    
    // Get the mocked service
    const n8nService = require('../../src/services/n8nService');
    
    // Create app without starting server
    const { createApp } = require('../../server');
    app = createApp();
  });

  beforeEach(() => {
    // Clean up any pending nock interceptors
    nock.cleanAll();
    // Clear messages before each test
    messageService.clearMessages();
    // Reset mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Clean up any pending nock interceptors
    if (global.nock) {
      global.nock.cleanAll();
    }
  });

  describe('GET /health', () => {
    test('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  describe('GET /api/health', () => {
    test('should return detailed health information', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('memory');
    });
  });

  describe('GET /api/messages', () => {
    test('should return empty messages when none exist', async () => {
      const response = await request(app)
        .get('/api/messages')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('messages');
      expect(response.body.messages).toEqual([]);
      expect(response.body).toHaveProperty('total', 0);
    });

    test('should return messages when they exist', async () => {
      const testMessage = {
        text: 'Test message',
        sender: 'Test User',
        timestamp: new Date().toISOString(),
        source: 'client'
      };

      messageService.addMessage(testMessage);

      const response = await request(app)
        .get('/api/messages')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.messages).toHaveLength(1);
      expect(response.body.messages[0]).toMatchObject({
        text: 'Test message',
        sender: 'Test User',
        source: 'client'
      });
      expect(response.body).toHaveProperty('total', 1);
    });
  });

  describe('GET /api/stats', () => {
    test('should return application statistics', async () => {
      const response = await request(app)
        .get('/api/stats')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('stats');
      expect(response.body.stats).toHaveProperty('total');
      expect(response.body.stats).toHaveProperty('today');
      expect(response.body.stats).toHaveProperty('bySource');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('POST /api/send-to-n8n', () => {
    test('should send message to n8n webhook', async () => {
      // Mock n8n service
      const n8nService = require('../../src/services/n8nService');
      n8nService.sendMessage.mockResolvedValue({
        success: true,
        data: { output: 'Success from n8n' }
      });

      const messageData = {
        text: 'Test message to n8n',
        sender: 'Test User'
      };

      const response = await request(app)
        .post('/api/send-to-n8n')
        .send(messageData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(n8nService.sendMessage).toHaveBeenCalledWith(expect.objectContaining({
        text: 'Test message to n8n',
        sender: 'Test User'
      }));
    });

    test('should handle n8n webhook failure', async () => {
      // Mock n8n service failure
      const n8nService = require('../../src/services/n8nService');
      n8nService.sendMessage.mockResolvedValue({
        success: false,
        error: 'Connection failed'
      });

      const messageData = {
        text: 'Test message to n8n',
        sender: 'Test User'
      };

      const response = await request(app)
        .post('/api/send-to-n8n')
        .send(messageData)
        .expect(500);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    test('should handle empty payload', async () => {
      // Mock n8n service for empty payload
      const n8nService = require('../../src/services/n8nService');
      n8nService.sendMessage.mockResolvedValue({
        success: true,
        data: { output: 'Handled empty payload' }
      });

      const response = await request(app)
        .post('/api/send-to-n8n')
        .send({}) // Empty payload
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    test('should handle missing text field', async () => {
      // Mock n8n service
      const n8nService = require('../../src/services/n8nService');
      n8nService.sendMessage.mockResolvedValue({
        success: true,
        data: { output: 'Handled missing text' }
      });

      const response = await request(app)
        .post('/api/send-to-n8n')
        .send({
          sender: 'Test User'
          // Missing text
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    test('should handle missing sender field', async () => {
      // Mock n8n service
      const n8nService = require('../../src/services/n8nService');
      n8nService.sendMessage.mockResolvedValue({
        success: true,
        data: { output: 'Handled missing sender' }
      });

      const response = await request(app)
        .post('/api/send-to-n8n')
        .send({
          text: 'Test message'
          // Missing sender
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('GET /api/test-n8n', () => {
    test('should test n8n connection successfully', async () => {
      // Mock successful n8n connection
      const n8nService = require('../../src/services/n8nService');
      n8nService.testConnection.mockResolvedValue(true);

      const response = await request(app)
        .get('/api/test-n8n')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('webhook_url');
    });

    test('should handle n8n connection failure', async () => {
      // Mock failed n8n connection
      const n8nService = require('../../src/services/n8nService');
      n8nService.testConnection.mockResolvedValue(false);

      const response = await request(app)
        .get('/api/test-n8n')
        .expect(200);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('webhook_url');
    });
  });

  describe('DELETE /api/messages', () => {
    test('should clear all messages with admin key', async () => {
      // Add some test messages
      messageService.addMessage({
        text: 'Test message 1',
        sender: 'User 1',
        timestamp: new Date().toISOString(),
        source: 'client'
      });

      messageService.addMessage({
        text: 'Test message 2',
        sender: 'User 2',
        timestamp: new Date().toISOString(),
        source: 'client'
      });

      expect(messageService.getAllMessages()).toHaveLength(2);

      const response = await request(app)
        .delete('/api/messages')
        .set('x-admin-key', 'test-admin-key')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(messageService.getAllMessages()).toHaveLength(0);
    });

    test('should reject request without admin key in production', async () => {
      // Set NODE_ENV to production to enforce auth
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      process.env.ADMIN_KEY = 'correct-admin-key';
      
      const response = await request(app)
        .delete('/api/messages')
        .expect(401);

      expect(response.body).toHaveProperty('error');
      
      // Restore original env
      process.env.NODE_ENV = originalEnv;
      delete process.env.ADMIN_KEY;
    });

    test('should reject request with invalid admin key in production', async () => {
      // Set NODE_ENV to production to enforce auth
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      process.env.ADMIN_KEY = 'correct-admin-key';
      
      const response = await request(app)
        .delete('/api/messages')
        .set('x-admin-key', 'invalid-key')
        .expect(401);

      expect(response.body).toHaveProperty('error');
      
      // Restore original env
      process.env.NODE_ENV = originalEnv;
      delete process.env.ADMIN_KEY;
    });
  });

  describe('Error Handling', () => {
    test('should handle 404 for non-existent API endpoints', async () => {
      const response = await request(app)
        .get('/api/non-existent')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    test('should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/send-to-n8n')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400);

      // Express handles malformed JSON with 400 status
      expect(response.status).toBe(400);
    });

    test('should handle large payloads', async () => {
      const largeText = 'x'.repeat(15000000); // 15MB text

      const response = await request(app)
        .post('/api/send-to-n8n')
        .send({
          text: largeText,
          sender: 'Test User'
        })
        .expect(413); // Payload too large

      expect(response.status).toBe(413);
    });
  });

  describe('Security Headers', () => {
    test('should include security headers in responses', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
    });
  });

  describe('CORS', () => {
    test('should handle preflight OPTIONS requests', async () => {
      const response = await request(app)
        .options('/api/health')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'GET')
        .expect(200);

      // Check if CORS headers are present
      expect(response.headers['access-control-allow-origin'] || response.headers['Access-Control-Allow-Origin']).toBeDefined();
    });
  });
});