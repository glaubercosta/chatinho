/**
 * API Routes
 * Handles HTTP endpoints for the chat application
 */

const express = require('express');
const router = express.Router();
const messageService = require('../services/messageService');
const n8nService = require('../services/n8nService');

// Get chat history
router.get('/messages', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const messages = messageService.getMessages(limit);
    res.json({
      success: true,
      messages: messages,
      total: messages.length
    });
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve messages'
    });
  }
});

// Send message to n8n
router.post('/send-to-n8n', async (req, res) => {
  try {
    const messageData = {
      text: req.body.text || req.body.message,
      sender: req.body.sender || 'API',
      timestamp: req.body.timestamp || new Date().toISOString(),
      id: req.body.id || Date.now().toString()
    };

    const response = await n8nService.sendMessage(messageData);
    
    if (response.success) {
      res.json({
        success: true,
        message: 'Message sent to n8n successfully',
        response: response.data
      });
    } else {
      res.status(500).json({
        success: false,
        error: response.error || 'Failed to send message to n8n'
      });
    }
  } catch (error) {
    console.error('Error sending to n8n:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Test n8n connection
router.get('/test-n8n', async (req, res) => {
  try {
    const result = await n8nService.testConnection();
    
    if (result) {
      res.json({
        success: true,
        message: 'n8n connection test successful',
        webhook_url: process.env.N8N_WEBHOOK_URL || 'Not configured'
      });
    } else {
      res.json({
        success: false,
        message: 'n8n connection test failed',
        webhook_url: process.env.N8N_WEBHOOK_URL || 'Not configured'
      });
    }
  } catch (error) {
    console.error('Error testing n8n:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test n8n connection'
    });
  }
});

// Get application statistics
router.get('/stats', (req, res) => {
  try {
    const stats = messageService.getStats();
    res.json({
      success: true,
      stats: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve statistics'
    });
  }
});

// Clear all messages (admin endpoint)
router.delete('/messages', (req, res) => {
  try {
    const adminKey = req.headers['x-admin-key'] || req.query.adminKey;
    
    // Simple admin authentication (in production, use proper auth)
    if (adminKey !== process.env.ADMIN_KEY && process.env.NODE_ENV === 'production') {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    messageService.clearMessages();
    res.json({
      success: true,
      message: 'All messages cleared'
    });
  } catch (error) {
    console.error('Error clearing messages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear messages'
    });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

module.exports = router;