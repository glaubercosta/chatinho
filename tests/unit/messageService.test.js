/**
 * Message Service Unit Tests
 * Following TDD methodology - aligned with real implementation
 */

const messageService = require('../../src/services/messageService');

describe('MessageService', () => {
  beforeEach(() => {
    // Clear messages before each test
    messageService.clearMessages();
  });

  afterEach(() => {
    // Clean up after each test
    messageService.clearMessages();
  });

  describe('addMessage', () => {
    test('should add message with generated ID and timestamp', () => {
      const messageData = {
        text: 'Test message',
        sender: 'Test User'
      };
      
      const result = messageService.addMessage(messageData);
      
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('timestamp');
      expect(result.text).toBe('Test message');
      expect(result.sender).toBe('Test User');
      expect(result.source).toBe('client');
    });

    test('should handle missing sender', () => {
      const messageData = {
        text: 'Test message without sender'
      };
      
      const result = messageService.addMessage(messageData);
      
      expect(result.sender).toBe('Anonymous');
    });

    test('should add message to storage', () => {
      const messageData = {
        text: 'Test message',
        sender: 'Test User'
      };
      
      messageService.addMessage(messageData);
      const messages = messageService.getAllMessages();
      
      expect(messages).toHaveLength(1);
      expect(messages[0].text).toBe('Test message');
    });

    test('should generate unique IDs for multiple messages', () => {
      const messages = [];
      
      for (let i = 0; i < 5; i++) {
        const result = messageService.addMessage({
          text: `Message ${i}`,
          sender: 'Test User'
        });
        messages.push(result);
      }
      
      const ids = messages.map(m => m.id);
      const uniqueIds = [...new Set(ids)];
      
      expect(uniqueIds).toHaveLength(5);
    });

    test('should handle different message sources', () => {
      const clientMessage = messageService.addMessage({
        text: 'Client message',
        sender: 'User',
        source: 'client'
      });
      
      const webhookMessage = messageService.addMessage({
        text: 'Webhook message',
        sender: 'Webhook',
        source: 'webhook'
      });
      
      expect(clientMessage.source).toBe('client');
      expect(webhookMessage.source).toBe('webhook');
    });
  });

  describe('addN8nResponse', () => {
    test('should add n8n response message', () => {
      const responseData = {
        id: 12345,
        text: 'Response from n8n',
        sender: 'Alice (n8n)',
        timestamp: new Date().toISOString(),
        source: 'n8n'
      };
      
      const result = messageService.addN8nResponse(responseData);
      
      expect(result).toEqual(responseData);
      expect(messageService.getAllMessages()).toHaveLength(1);
      expect(messageService.getAllMessages()[0]).toEqual(responseData);
    });
  });

  describe('addSystemMessage', () => {
    test('should add system message with default type', () => {
      const text = 'System notification';
      
      const result = messageService.addSystemMessage(text);
      
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('timestamp');
      expect(result.text).toBe(text);
      expect(result.sender).toBe('Sistema');
      expect(result.source).toBe('system');
      expect(result.type).toBe('info');
    });

    test('should add system message with custom type', () => {
      const text = 'Error occurred';
      const type = 'error';
      
      const result = messageService.addSystemMessage(text, type);
      
      expect(result.type).toBe('error');
      expect(result.text).toBe(text);
    });
  });

  describe('getAllMessages', () => {
    test('should return empty array when no messages', () => {
      const messages = messageService.getAllMessages();
      
      expect(messages).toEqual([]);
      expect(Array.isArray(messages)).toBe(true);
    });

    test('should return all messages', () => {
      messageService.addMessage({ text: 'Message 1', sender: 'User 1' });
      messageService.addMessage({ text: 'Message 2', sender: 'User 2' });
      
      const messages = messageService.getAllMessages();
      
      expect(messages).toHaveLength(2);
      expect(messages[0].text).toBe('Message 1');
      expect(messages[1].text).toBe('Message 2');
    });

    test('should return copy of messages array', () => {
      messageService.addMessage({ text: 'Original message', sender: 'User' });
      
      const messages = messageService.getAllMessages();
      messages.push({ text: 'Modified', sender: 'Hacker' });
      
      // Original array should be unchanged
      expect(messageService.getAllMessages()).toHaveLength(1);
    });
  });

  describe('getRecentMessages', () => {
    test('should return recent messages with default limit', () => {
      // Add 60 messages
      for (let i = 0; i < 60; i++) {
        messageService.addMessage({ text: `Message ${i}`, sender: 'User' });
      }
      
      const recent = messageService.getRecentMessages();
      
      expect(recent).toHaveLength(50); // Default limit
      expect(recent[0].text).toBe('Message 10'); // Last 50 messages
      expect(recent[49].text).toBe('Message 59');
    });

    test('should return recent messages with custom limit', () => {
      for (let i = 0; i < 20; i++) {
        messageService.addMessage({ text: `Message ${i}`, sender: 'User' });
      }
      
      const recent = messageService.getRecentMessages(10);
      
      expect(recent).toHaveLength(10);
      expect(recent[0].text).toBe('Message 10');
      expect(recent[9].text).toBe('Message 19');
    });

    test('should return all messages if less than limit', () => {
      messageService.addMessage({ text: 'Message 1', sender: 'User' });
      messageService.addMessage({ text: 'Message 2', sender: 'User' });
      
      const recent = messageService.getRecentMessages(10);
      
      expect(recent).toHaveLength(2);
    });
  });

  describe('clearMessages', () => {
    test('should clear all messages', () => {
      messageService.addMessage({ text: 'Message 1', sender: 'User 1' });
      messageService.addMessage({ text: 'Message 2', sender: 'User 2' });
      
      expect(messageService.getAllMessages()).toHaveLength(2);
      
      messageService.clearMessages();
      
      expect(messageService.getAllMessages()).toHaveLength(0);
      expect(messageService.getAllMessages()).toEqual([]);
    });

    test('should handle clearing empty message store', () => {
      expect(() => {
        messageService.clearMessages();
      }).not.toThrow();
      
      expect(messageService.getAllMessages()).toEqual([]);
    });
  });
});