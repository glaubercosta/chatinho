/**
 * End-to-End Tests
 * Following TDD methodology - Complete user workflow testing
 */

// Mock the n8nService before requiring anything
jest.mock('../../src/services/n8nService');

const request = require('supertest');
const path = require('path');

describe('E2E Tests - Simplified Workflows', () => {
  let app;
  let n8nService;

  beforeAll(() => {
    // Set test environment
    process.env.NODE_ENV = 'test';
    process.env.PORT = '3005';
    process.env.N8N_WEBHOOK_URL = 'http://localhost:5678/webhook/test';
    process.env.ADMIN_API_KEY = 'test-admin-key';

    // Get the mocked service
    n8nService = require('../../src/services/n8nService');
    
    // Create app without starting server
    const { createApp } = require('../../server');
    app = createApp();
  });

  beforeEach(() => {
    // Clear message store
    const messageService = require('../../src/services/messageService');
    messageService.clearMessages();
    
    // Clear all mocks
    jest.clearAllMocks();
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

      expect(response.body.status).toBe('healthy');
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