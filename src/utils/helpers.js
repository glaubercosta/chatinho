/**
 * Utility Functions
 * Common helper functions used throughout the application
 */

/**
 * Generate unique ID
 */
const generateId = (prefix = '') => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 9);
  return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
};

/**
 * Format timestamp for display
 */
const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  // Less than 1 minute
  if (diff < 60000) {
    return 'agora mesmo';
  }
  
  // Less than 1 hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes} min atrás`;
  }
  
  // Less than 24 hours
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}h atrás`;
  }
  
  // Same year
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  // Different year
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Validate message data
 */
const validateMessage = (data) => {
  const errors = [];
  
  if (!data) {
    errors.push('Message data is required');
    return { valid: false, errors };
  }
  
  if (!data.text || typeof data.text !== 'string') {
    errors.push('Message text is required and must be a string');
  }
  
  if (!data.sender || typeof data.sender !== 'string') {
    errors.push('Sender is required and must be a string');
  }
  
  if (data.text && data.text.length > 1000) {
    errors.push('Message text cannot exceed 1000 characters');
  }
  
  if (data.sender && data.sender.length > 50) {
    errors.push('Sender name cannot exceed 50 characters');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Sanitize string input
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  
  return str
    .trim()
    .replace(/[<>]/g, '') // Remove basic HTML tags
    .replace(/\s+/g, ' '); // Normalize whitespace
};

/**
 * Format file size
 */
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Debounce function
 */
const debounce = (func, wait) => {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function
 */
const throttle = (func, limit) => {
  let inThrottle;
  
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Deep clone object
 */
const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    Object.keys(obj).forEach(key => {
      clonedObj[key] = deepClone(obj[key]);
    });
    return clonedObj;
  }
};

/**
 * Check if object is empty
 */
const isEmpty = (obj) => {
  if (!obj) return true;
  if (Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return false;
};

/**
 * Format error for logging
 */
const formatError = (error) => {
  return {
    message: error.message,
    stack: error.stack,
    name: error.name,
    timestamp: new Date().toISOString()
  };
};

/**
 * Retry function with exponential backoff
 */
const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), 10000);
      console.log(`⏳ Retry attempt ${attempt}/${maxRetries} in ${delay}ms`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

/**
 * Safe JSON parse
 */
const safeJsonParse = (str, defaultValue = null) => {
  try {
    return JSON.parse(str);
  } catch (error) {
    console.warn('❌ JSON parse error:', error.message);
    return defaultValue;
  }
};

/**
 * Safe JSON stringify
 */
const safeJsonStringify = (obj, defaultValue = '{}') => {
  try {
    return JSON.stringify(obj);
  } catch (error) {
    console.warn('❌ JSON stringify error:', error.message);
    return defaultValue;
  }
};

/**
 * Get client IP from request
 */
const getClientIP = (req) => {
  return req.ip || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         'unknown';
};

/**
 * Environment helpers
 */
const env = {
  isDevelopment: () => process.env.NODE_ENV === 'development',
  isProduction: () => process.env.NODE_ENV === 'production',
  isTest: () => process.env.NODE_ENV === 'test'
};

/**
 * Performance timer
 */
const createTimer = () => {
  const start = process.hrtime.bigint();
  
  return {
    stop: () => {
      const end = process.hrtime.bigint();
      const duration = Number(end - start) / 1_000_000; // Convert to milliseconds
      return Math.round(duration * 100) / 100; // Round to 2 decimal places
    }
  };
};

module.exports = {
  generateId,
  formatTimestamp,
  validateMessage,
  sanitizeString,
  formatFileSize,
  debounce,
  throttle,
  deepClone,
  isEmpty,
  formatError,
  retryWithBackoff,
  safeJsonParse,
  safeJsonStringify,
  getClientIP,
  env,
  createTimer
};