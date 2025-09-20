/**
 * Configuration module for Chatinho application
 * Centralizes all environment variables and application settings
 */

require('dotenv').config();

const config = {
  // Server configuration
  server: {
    port: process.env.PORT || 3002,
    host: process.env.HOST || 'localhost',
    env: process.env.NODE_ENV || 'development'
  },

  // n8n webhook configuration
  n8n: {
    webhookUrl: process.env.N8N_WEBHOOK_URL || '',
    timeout: process.env.N8N_TIMEOUT || 10000,
    retryAttempts: process.env.N8N_RETRY_ATTEMPTS || 3
  },

  // Socket.IO configuration
  socketio: {
    cors: {
      origin: process.env.CORS_ORIGIN || "*",
      methods: ["GET", "POST"]
    },
    pingTimeout: process.env.SOCKET_PING_TIMEOUT || 60000,
    pingInterval: process.env.SOCKET_PING_INTERVAL || 25000
  },

  // Application settings
  app: {
    maxMessages: process.env.MAX_MESSAGES || 1000,
    messageRetentionHours: process.env.MESSAGE_RETENTION_HOURS || 24,
    logLevel: process.env.LOG_LEVEL || 'info'
  }
};

// Validation
if (!config.n8n.webhookUrl && config.server.env === 'production') {
  console.warn('⚠️  N8N_WEBHOOK_URL is not configured for production environment');
}

module.exports = config;