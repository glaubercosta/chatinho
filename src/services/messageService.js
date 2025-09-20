/**
 * Message Service
 * Handles message storage, retrieval and management
 */

const config = require('../config');

class MessageService {
  constructor() {
    this.messages = [];
    this.maxMessages = config.app.maxMessages;
    this.retentionHours = config.app.messageRetentionHours;
    
    // Clean up old messages periodically
    this.startCleanupInterval();
  }

  /**
   * Add new message to storage
   * @param {Object} messageData - Message data from client
   * @returns {Object} - Formatted message object
   */
  addMessage(messageData) {
    const message = {
      id: Date.now() + Math.random(),
      text: messageData.text,
      sender: messageData.sender || 'Anonymous',
      timestamp: new Date().toISOString(),
      source: messageData.source || 'client'
    };

    this.messages.push(message);
    this.enforceMessageLimit();
    
    console.log(`📝 Message added: ${message.sender} - ${message.text.substring(0, 50)}...`);
    return message;
  }

  /**
   * Add n8n response message
   * @param {Object} responseData - Formatted response from n8n service
   * @returns {Object} - Message object
   */
  addN8nResponse(responseData) {
    this.messages.push(responseData);
    this.enforceMessageLimit();
    
    console.log(`🤖 n8n response added: ${responseData.text.substring(0, 50)}...`);
    return responseData;
  }

  /**
   * Add system message (errors, notifications, etc.)
   * @param {string} text - Message text
   * @param {string} type - Message type (error, info, warning)
   * @returns {Object} - Message object
   */
  addSystemMessage(text, type = 'info') {
    const message = {
      id: Date.now() + Math.random(),
      text: text,
      sender: 'Sistema',
      timestamp: new Date().toISOString(),
      source: 'system',
      type: type
    };

    this.messages.push(message);
    this.enforceMessageLimit();
    
    console.log(`🔧 System message: ${text}`);
    return message;
  }

  /**
   * Get all messages
   * @returns {Array} - Array of message objects
   */
  getAllMessages() {
    return [...this.messages]; // Return copy to prevent external modification
  }

  /**
   * Get recent messages
   * @param {number} limit - Number of messages to return
   * @returns {Array} - Array of recent messages
   */
  getRecentMessages(limit = 50) {
    return this.messages.slice(-limit);
  }

  /**
   * Clear all messages
   */
  clearMessages() {
    const count = this.messages.length;
    this.messages = [];
    console.log(`🗑️  Cleared ${count} messages`);
  }

  /**
   * Enforce message limit to prevent memory issues
   */
  enforceMessageLimit() {
    if (this.messages.length > this.maxMessages) {
      const removed = this.messages.length - this.maxMessages;
      this.messages = this.messages.slice(-this.maxMessages);
      console.log(`📦 Trimmed ${removed} old messages (limit: ${this.maxMessages})`);
    }
  }

  /**
   * Remove messages older than retention period
   */
  cleanupOldMessages() {
    const cutoffTime = new Date(Date.now() - (this.retentionHours * 60 * 60 * 1000));
    const originalCount = this.messages.length;
    
    this.messages = this.messages.filter(msg => 
      new Date(msg.timestamp) > cutoffTime
    );
    
    const removed = originalCount - this.messages.length;
    if (removed > 0) {
      console.log(`🧹 Cleaned up ${removed} old messages (retention: ${this.retentionHours}h)`);
    }
  }

  /**
   * Start periodic cleanup of old messages
   */
  startCleanupInterval() {
    // Skip interval during tests
    if (process.env.NODE_ENV === 'test') {
      return;
    }
    
    // Run cleanup every hour
    this.cleanupIntervalId = setInterval(() => {
      this.cleanupOldMessages();
    }, 60 * 60 * 1000);
  }

  /**
   * Stop cleanup interval (for tests and shutdown)
   */
  stopCleanupInterval() {
    if (this.cleanupIntervalId) {
      clearInterval(this.cleanupIntervalId);
      this.cleanupIntervalId = null;
    }
  }

  /**
   * Get messages with optional limit
   * @param {number} limit - Maximum number of messages to return
   * @returns {Array} - Array of messages
   */
  getMessages(limit = null) {
    if (limit && limit > 0) {
      return this.messages.slice(-limit);
    }
    return [...this.messages];
  }

  /**
   * Get all messages
   * @returns {Array} - All messages
   */
  getAllMessages() {
    return [...this.messages];
  }

  /**
   * Get total message count
   * @returns {number} - Total number of messages
   */
  getTotalMessages() {
    return this.messages.length;
  }

  /**
   * Clear all messages
   */
  clearMessages() {
    const count = this.messages.length;
    this.messages = [];
    console.log(`🧹 Cleared ${count} messages`);
  }

  /**
   * Get statistics about messages
   * @returns {Object} - Message statistics
   */
  getStats() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const todayMessages = this.messages.filter(msg => 
      new Date(msg.timestamp) >= today
    );

    const sourceStats = this.messages.reduce((acc, msg) => {
      acc[msg.source] = (acc[msg.source] || 0) + 1;
      return acc;
    }, {});

    return {
      total: this.messages.length,
      today: todayMessages.length,
      bySource: sourceStats,
      oldestMessage: this.messages.length > 0 ? this.messages[0].timestamp : null,
      newestMessage: this.messages.length > 0 ? this.messages[this.messages.length - 1].timestamp : null
    };
  }
}

// Create and export singleton instance
const messageService = new MessageService();
module.exports = messageService;