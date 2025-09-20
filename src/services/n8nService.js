/**
 * N8N Webhook Service
 * Handles all communication with n8n workflows
 */

const config = require('../config');

class N8nWebhookService {
  constructor() {
    this.webhookUrl = config.n8n.webhookUrl;
    this.timeout = config.n8n.timeout;
    this.retryAttempts = config.n8n.retryAttempts;
  }

  /**
   * Send message to n8n webhook and return response
   * @param {Object} message - Message object containing text, sender, etc.
   * @returns {Promise<Object>} - n8n response or null if failed
   */
  async sendMessage(message) {
    if (!this.webhookUrl) {
      console.warn('⚠️  N8N webhook URL not configured');
      return null;
    }

    const payload = this.formatPayload(message);
    console.log('📤 Sending to n8n:', payload);

    try {
      const fetch = (await import('node-fetch')).default;
      
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        timeout: this.timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const n8nResponse = await response.json();
      console.log('📥 n8n response received:', n8nResponse);
      
      return {
        success: true,
        data: this.processResponse(n8nResponse)
      };
    } catch (error) {
      console.error('❌ Error sending to n8n:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Format message payload for n8n webhook
   * @param {Object} message - Original message
   * @returns {Object} - Formatted payload
   */
  formatPayload(message) {
    return {
      text: message.text,
      id: message.id || Date.now().toString(),
      sender: message.sender,
      timestamp: message.timestamp || new Date().toISOString()
    };
  }

  /**
   * Process n8n response and create chat message
   * @param {Object} n8nResponse - Raw response from n8n
   * @returns {Object} - Formatted chat message
   */
  processResponse(n8nResponse) {
    // Handle null or undefined response
    if (!n8nResponse) {
      return {
        id: Date.now() + Math.random(), // Unique ID
        text: String(n8nResponse), // Will be 'null' or 'undefined'
        sender: 'Alice (n8n)',
        timestamp: new Date().toISOString(),
        source: 'n8n'
      };
    }

    return {
      id: Date.now() + Math.random(), // Unique ID
      text: n8nResponse.output || n8nResponse.message || JSON.stringify(n8nResponse),
      sender: 'Alice (n8n)',
      timestamp: new Date().toISOString(),
      source: 'n8n'
    };
  }

  /**
   * Test webhook connectivity
   * @returns {Promise<boolean>} - Connection status
   */
  async testConnection() {
    const testMessage = {
      text: "Teste de conectividade do Chatinho",
      id: `test_${Date.now()}`,
      sender: "Sistema",
      timestamp: new Date().toISOString()
    };

    const response = await this.sendMessage(testMessage);
    return response !== null;
  }
}

// Create and export singleton instance
const n8nService = new N8nWebhookService();
module.exports = n8nService;