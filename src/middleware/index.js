/**
 * Custom Middleware
 * Contains custom middleware functions for the application
 */

const config = require('../config');

/**
 * Request logging middleware
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();
  
  // Log request
  console.log(`📡 ${timestamp} ${req.method} ${req.url} - ${req.ip}`);
  
  // Log response time when request completes
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`📡 ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
  });
  
  next();
};

/**
 * Error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  
  // Don't expose internal errors in production
  const isDevelopment = config.server.env === 'development';
  
  res.status(err.status || 500).json({
    success: false,
    error: isDevelopment ? err.message : 'Internal server error',
    ...(isDevelopment && { stack: err.stack })
  });
};

/**
 * CORS middleware (if not using the cors package)
 */
const corsHandler = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', config.socketio.cors.origin);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, X-Admin-Key');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
};

/**
 * Rate limiting middleware (basic implementation)
 */
const rateLimiter = (maxRequests = 100, windowMs = 60000) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const clientId = req.ip;
    const now = Date.now();
    
    // Clean old entries
    for (const [ip, data] of requests) {
      if (now - data.firstRequest > windowMs) {
        requests.delete(ip);
      }
    }
    
    // Check current client
    const clientData = requests.get(clientId);
    
    if (!clientData) {
      requests.set(clientId, { count: 1, firstRequest: now });
      next();
    } else if (clientData.count < maxRequests) {
      clientData.count++;
      next();
    } else {
      res.status(429).json({
        success: false,
        error: 'Too many requests, please try again later'
      });
    }
  };
};

/**
 * Request validation middleware
 */
const validateWebhookPayload = (req, res, next) => {
  // Basic validation for webhook payloads
  if (req.method === 'POST' && req.path.includes('webhook')) {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Invalid payload: body must be a JSON object'
      });
    }
  }
  next();
};

/**
 * Security headers middleware
 */
const securityHeaders = (req, res, next) => {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  
  if (config.server.env === 'production') {
    res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  next();
};

module.exports = {
  requestLogger,
  errorHandler,
  corsHandler,
  rateLimiter,
  validateWebhookPayload,
  securityHeaders
};