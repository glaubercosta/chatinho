/**
 * Socket.IO Integration Tests - Simplified Version
 * Following TDD methodology
 */

const request = require('supertest');
const nock = require('nock');

describe('Socket.IO Tests', () => {
  let app;

  beforeAll(() => {
    // Use the main app for testing
    process.env.NODE_ENV = 'test';
    process.env.PORT = '3010';
    app = require('../../server');
  });

  afterAll((done) => {
    if (app && app.close) {
      app.close(done);
    } else {
      done();
    }
  });

  beforeEach(() => {
    // Clear message store before each test
    const messageService = require('../../src/services/messageService');
    messageService.clearMessages();
    nock.cleanAll();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe('Socket.IO via Server', () => {
    test('should accept Socket.IO connections on server', async () => {
      // Test that the server has Socket.IO configured
      const response = await request(app)
        .get('/socket.io/')
        .expect(400); // Socket.IO handshake without proper headers returns 400
      
      expect(response.text).toContain('bad handshake method');
    });

    test('should serve socket.io client script', async () => {
      const response = await request(app)
        .get('/socket.io/socket.io.js')
        .expect(200);
      
      expect(response.text).toContain('socket.io');
    });
  });

  describe('Message Broadcasting Logic', () => {
    test('should store messages in messageService when received', () => {
      const messageService = require('../../src/services/messageService');
      
      const testMessage = {
        text: 'Test broadcast message',
        sender: 'Test User',
        source: 'client'
      };

      const addedMessage = messageService.addMessage(testMessage);
      
      expect(addedMessage.id).toBeDefined();
      expect(addedMessage.text).toBe('Test broadcast message');
      expect(addedMessage.sender).toBe('Test User');
      expect(addedMessage.timestamp).toBeDefined();
    });

    test('should handle message validation', () => {
      const messageService = require('../../src/services/messageService');
      
      // Test with invalid message (no text)
      expect(() => {
        messageService.addMessage({
          sender: 'Test User',
          source: 'client'
        });
      }).toThrow();
      
      // Test with invalid message (no sender)
      expect(() => {
        messageService.addMessage({
          text: 'Test message',
          source: 'client'
        });
      }).toThrow();
    });
  });

  describe('N8n Integration Logic', () => {
    test('should handle n8n service calls', async () => {
      // Mock successful n8n response
      nock('http://localhost:5678')
        .post('/webhook/test')
        .reply(200, { output: 'Response from n8n' });

      const n8nService = require('../../src/services/n8nService');
      
      const result = await n8nService.sendMessage({
        text: 'Test message to n8n',
        sender: 'Test User'
      });

      expect(result.success).toBe(true);
      expect(result.response).toBeDefined();
    });

    test('should handle n8n service failures', async () => {
      // Mock failed n8n response
      nock('http://localhost:5678')
        .post('/webhook/test')
        .reply(500, 'Server Error');

      const n8nService = require('../../src/services/n8nService');
      
      const result = await n8nService.sendMessage({
        text: 'Test message to failing n8n',
        sender: 'Test User'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Configuration Tests', () => {
    test('should have correct Socket.IO configuration', () => {
      // Test basic Socket.IO setup without actual connections
      const config = require('../../src/config');
      
      expect(config.socketio).toBeDefined();
      expect(config.socketio.cors).toBeDefined();
      expect(config.socketio.transports).toContain('websocket');
      expect(config.socketio.transports).toContain('polling');
    });

    test('should have message service available', () => {
      const messageService = require('../../src/services/messageService');
      
      expect(messageService).toBeDefined();
      expect(typeof messageService.addMessage).toBe('function');
      expect(typeof messageService.getMessages).toBe('function');
      expect(typeof messageService.clearMessages).toBe('function');
    });
  });
});