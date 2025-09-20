/**
 * End-to-End Tests
 * Following TDD methodology - Complete user workflow testing
 */

const request = require('supertest');
const Client = require('socket.io-client');
const nock = require('nock');
const path = require('path');

describe('E2E Tests - Simplified Workflows', () => {
  let app;

  beforeAll(() => {
    // Set test environment
    process.env.NODE_ENV = 'test';
    process.env.PORT = '3005';
    process.env.N8N_WEBHOOK_URL = 'http://localhost:5678/webhook/test';
    process.env.ADMIN_API_KEY = 'test-admin-key';

    // Import app after setting environment
    app = require('../../server');
  });

  beforeEach(() => {
    // Clear message store
    const messageService = require('../../src/services/messageService');
    messageService.clearMessages();
    nock.cleanAll();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe('Basic App Functionality', () => {
    test('should serve the main chat page', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.text).toContain('Chatinho');
    });

    test('should handle health check', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('OK');
    });

    test('should handle basic webhook integration', async () => {
      // Send webhook message via API
      const webhookPayload = {
        message: 'Test webhook message',
        sender: 'External System'
      };

      const response = await request(app)
        .post('/webhook/n8n')
        .send(webhookPayload)
        .expect(200);

      expect(response.text).toContain('success');
    });

    test('should handle message storage and retrieval', async () => {
      const messageService = require('../../src/services/messageService');
      
      // Add a test message
      const testMessage = messageService.addMessage({
        text: 'E2E test message',
        sender: 'E2E Test User',
        source: 'client'
      });

      expect(testMessage.id).toBeDefined();
      
      // Retrieve messages
      const messages = messageService.getMessages();
      expect(messages).toHaveLength(1);
      expect(messages[0].text).toBe('E2E test message');
    });
  });
});