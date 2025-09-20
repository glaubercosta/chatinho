/**
 * Chatinho - Main Server
 * Real-time chat application with n8n webhook integration
 * 
 * @author Chatinho Team
 * @version 2.0.0
 */

// Core modules
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
require('dotenv').config();

// Application modules
const config = require('./src/config');
const { requestLogger, errorHandler, securityHeaders, rateLimiter, validateWebhookPayload } = require('./src/middleware');
const apiRoutes = require('./src/routes/api');
const webhookRoutes = require('./src/routes/webhooks');
const SocketController = require('./src/controllers/socketController');
const { createTimer } = require('./src/utils/helpers');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with configuration
const io = socketIo(server, {
  cors: config.socketio.cors,
  transports: ['websocket', 'polling'],
  pingTimeout: config.socketio.pingTimeout,
  pingInterval: config.socketio.pingInterval
});

// Initialize Socket Controller
const socketController = new SocketController(io);

// Security and logging middleware
app.use(securityHeaders);
app.use(requestLogger);

// Rate limiting
if (config.server.env === 'production') {
  app.use(rateLimiter(100, 60000)); // 100 requests per minute
}

// Body parsing and CORS
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Webhook payload validation
app.use(validateWebhookPayload);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Health check endpoint
app.get('/health', (req, res) => {
  const timer = createTimer();
  
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: require('./package.json').version,
    environment: config.server.env,
    responseTime: timer.stop()
  });
});

// Serve the chat interface
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API routes
app.use('/api', apiRoutes);

// Webhook routes (inject socketController for broadcasting)
app.use('/webhook', (req, res, next) => {
  req.socketController = socketController;
  next();
}, webhookRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  console.log(`🛑 Received ${signal}. Starting graceful shutdown...`);
  
  server.close((err) => {
    if (err) {
      console.error('❌ Error during server shutdown:', err);
      process.exit(1);
    }
    
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    console.log('❌ Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Listen for shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

// Start server
const startServer = () => {
  try {
    server.listen(config.server.port, () => {
      console.log('� Chatinho Server Started');
      console.log('📍 Server URL:', `http://localhost:${config.server.port}`);
      console.log('🌍 Environment:', config.server.env);
      console.log('🤖 n8n Webhook:', config.n8n.webhookUrl || 'Not configured');
      console.log('⚡ Socket.IO enabled with CORS:', config.socketio.cors.origin);
      console.log('📊 Memory usage:', process.memoryUsage());
      console.log('💾 Node version:', process.version);
      console.log('=' .repeat(50));
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

// Export for testing
module.exports = { app, server, io, socketController };