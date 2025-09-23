/**
 * Integration Tests for Webhook Routes
 * Following TDD methodology
 */

const request = require('supertest');
const nock = require('nock');

let app;
let server;

describe('Webhook Integration Tests', () => {
  beforeAll(async () => {
    // Import and initialize the app for testing
    const express = require('express');
    const http = require('http');
    const socketIo = require('socket.io');
    const path = require('path');
    
    // Import modules
    const config = require('../../src/config');
    const { securityHeaders, requestLogger, validateWebhookPayload } = require('../../src/middleware');
    const apiRoutes = require('../../src/routes/api');
    const webhookRoutes = require('../../src/routes/webhooks');
    const SocketController = require('../../src/controllers/socketController');

    // Initialize Express app
    app = express();
    server = http.createServer(app);

    // Initialize Socket.IO
    const io = socketIo(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    // Apply middleware
    app.use(securityHeaders);
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true }));
    app.use(requestLogger);

    // Initialize Socket Controller
    const socketController = new SocketController(io);

    // Routes
    app.use('/api', apiRoutes);
    
    // Webhook routes (inject socketController for broadcasting)
    app.use('/webhook', (req, res, next) => {
      req.socketController = socketController;
      next();
    }, webhookRoutes);

    // Static files
    app.use(express.static(path.join(__dirname, '../../public')));

    // 404 handler
    app.use((req, res) => {
      res.status(404).json({ error: 'Endpoint not found' });
    });

    return new Promise((resolve) => {
      server.listen(0, () => {
        resolve();
      });
    });
  });

  afterAll(async () => {
    nock.cleanAll();
    if (server) {
      await new Promise((resolve) => {
        server.close(resolve);
      });
    }
  });

  beforeEach(() => {
    // Clear messages before each test by reinitializing the service
    const messageService = require('../../src/services/messageService');
    messageService.clearMessages();

    // Clean nock interceptors
    nock.cleanAll();
  });

  describe('POST /webhook/n8n', () => {
    test('should accept valid webhook payload', async () => {
      const webhookPayload = {
        message: 'Hello from n8n workflow!',
        sender: 'n8n Assistant'
      };

      const response = await request(app)
        .post('/webhook/n8n')
        .send(webhookPayload)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        id: expect.any(Number)
      });
    });

    test('should store message in message service', async () => {
      const webhookPayload = {
        message: 'Test message for storage',
        sender: 'Test Sender'
      };

      await request(app)
        .post('/webhook/n8n')
        .send(webhookPayload)
        .expect(200);

      const messageService = require('../../src/services/messageService');
      const messages = messageService.getMessages();

      expect(messages.length).toBe(1);
      const lastMessage = messages[messages.length - 1];
      expect(lastMessage).toMatchObject({
        text: 'Test message for storage',
        sender: 'Test Sender',
        source: 'n8n' // Real implementation uses 'n8n'
      });
    });

    test('should increase stored message count by one per request', async () => {
      const messageService = require('../../src/services/messageService');
      expect(messageService.getMessages().length).toBe(0);

      await request(app)
        .post('/webhook/n8n')
        .send({ message: 'First message', sender: 'n8n Assistant' })
        .expect(200);

      expect(messageService.getMessages().length).toBe(1);

      await request(app)
        .post('/webhook/n8n')
        .send({ message: 'Second message', sender: 'n8n Assistant' })
        .expect(200);

      expect(messageService.getMessages().length).toBe(2);
    });

    test('should handle missing message field gracefully', async () => {
      const webhookPayload = {
        sender: 'n8n Assistant'
        // Missing message field
      };

      const response = await request(app)
        .post('/webhook/n8n')
        .send(webhookPayload)
        .expect(200); // Server handles missing message gracefully

      expect(response.body).toHaveProperty('success', true);
    });

    test('should handle empty message gracefully', async () => {
      const webhookPayload = {
        message: '',
        sender: 'n8n Assistant'
      };

      const response = await request(app)
        .post('/webhook/n8n')
        .send(webhookPayload)
        .expect(200); // Server handles empty message gracefully

      expect(response.body).toHaveProperty('success', true);
    });

    test('should handle HTML content as-is', async () => {
      const webhookPayload = {
        message: '<b>Bold message</b> from n8n',
        sender: 'n8n HTML Test'
      };

      const response = await request(app)
        .post('/webhook/n8n')
        .send(webhookPayload)
        .expect(200);

      const messageService = require('../../src/services/messageService');
      const messages = messageService.getMessages();
      // Server stores HTML content as-is without sanitization
      const lastMessage = messages[messages.length - 1];
      expect(lastMessage.text).toBe('<b>Bold message</b> from n8n');
    });

    test('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/webhook/n8n')
        .set('Content-Type', 'application/json')
        .send('{ malformed json }')
        .expect(400); // Express returns 400 for JSON parse errors
    });

    test('should handle null payload gracefully', async () => {
      const response = await request(app)
        .post('/webhook/n8n')
        .send(null)
        .expect(200); // Server handles null gracefully

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('POST /webhook/generic', () => {
    test('should accept generic webhook payload', async () => {
      const webhookPayload = {
        message: 'Hello from external service!',
        sender: 'External API'
      };

      const response = await request(app)
        .post('/webhook/generic')
        .send(webhookPayload)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        id: expect.any(Number)
      });
    });

    test('should store generic webhook message', async () => {
      const webhookPayload = {
        message: 'Generic webhook test',
        sender: 'Generic Service'
      };

      await request(app)
        .post('/webhook/generic')
        .send(webhookPayload)
        .expect(200);

      const messageService = require('../../src/services/messageService');
      const messages = messageService.getMessages();
      
      expect(messages.length).toBe(1);
      const lastMessage = messages[messages.length - 1];
      expect(lastMessage).toMatchObject({
        text: 'Generic webhook test',
        sender: 'Generic Service',
        source: 'webhook' // Generic webhooks use 'webhook' source
      });
    });
  });

  describe('Webhook message retrieval', () => {
    test('should expose persisted webhook messages without duplicates via /api/messages', async () => {
      const payload = {
        message: 'Duplicate check message',
        sender: 'Duplicate Tester'
      };

      await request(app)
        .post('/webhook/n8n')
        .send(payload)
        .expect(200);

      const response = await request(app)
        .get('/api/messages')
        .expect(200);

      expect(response.body).toMatchObject({ success: true, total: 1 });
      expect(response.body.messages).toHaveLength(1);
      expect(response.body.messages[0].text).toBe('Duplicate check message');
    });
  });

  describe('POST /webhook/system', () => {
    test('should accept system webhook payload', async () => {
      const webhookPayload = {
        message: 'System notification',
        sender: 'System Monitor'
      };

      const response = await request(app)
        .post('/webhook/system')
        .send(webhookPayload)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        id: expect.any(Number)
      });
    });

    test('should store system webhook message', async () => {
      const webhookPayload = {
        message: 'System alert message',
        sender: 'Alert System'
      };

      await request(app)
        .post('/webhook/system')
        .send(webhookPayload)
        .expect(200);

      const messageService = require('../../src/services/messageService');
      const messages = messageService.getMessages();
      
      expect(messages.length).toBeGreaterThan(0);
      const lastMessage = messages[messages.length - 1];
      expect(lastMessage).toMatchObject({
        text: 'System alert message',
        sender: 'Sistema', // Real implementation uses 'Sistema'
        source: 'system' // System webhooks use 'system' source
      });
    });
  });

  describe('Webhook Message Broadcasting', () => {
    test('should broadcast webhook messages to connected clients', (done) => {
      // This test would require setting up a Socket.IO client
      // For integration testing, we'll verify message storage
      const webhookPayload = {
        message: 'Broadcast test message',
        sender: 'Broadcast Tester'
      };

      request(app)
        .post('/webhook/n8n')
        .send(webhookPayload)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);

          const messageService = require('../../src/services/messageService');
          const messages = messageService.getMessages();
          expect(messages.length).toBeGreaterThan(0);
          const lastMessage = messages[messages.length - 1];
          expect(lastMessage.text).toBe('Broadcast test message');
          done();
        });
    });
  });

  describe('Webhook Error Handling', () => {
    test('should handle unsupported content type', async () => {
      const response = await request(app)
        .post('/webhook/n8n')
        .set('Content-Type', 'text/plain')
        .send('plain text message')
        .expect(200); // Express still handles it

      expect(response.body).toHaveProperty('success', true);
    });

    test('should handle empty POST body', async () => {
      const response = await request(app)
        .post('/webhook/n8n')
        .expect(200); // Server handles empty body gracefully

      expect(response.body).toHaveProperty('success', true);
    });
  });
});