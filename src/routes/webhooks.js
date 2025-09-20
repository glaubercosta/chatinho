/**
 * Webhook Routes
 * Handles incoming webhooks from external services (n8n, etc.)
 */

const express = require('express');
const router = express.Router();
const messageService = require('../services/messageService');

// Webhook endpoint for n8n to send messages
router.post('/n8n', (req, res) => {
  try {
    console.log('📨 Received webhook from n8n:', req.body);
    
    const messageData = {
      text: req.body.message || req.body.text || 'Message from n8n',
      sender: req.body.sender || 'Alice (n8n)',
      source: 'n8n',
      timestamp: new Date().toISOString(),
      id: Date.now() + Math.random()
    };

    // Add message to storage
    const message = messageService.addN8nResponse(messageData);
    
    // Broadcast to all connected clients via socketController
    if (req.socketController) {
      req.socketController.broadcastExternalMessage(message);
    }
    
    res.json({ 
      success: true, 
      message: 'Message received and broadcasted',
      id: message.id
    });
    
  } catch (error) {
    console.error('❌ Error processing n8n webhook:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process webhook'
    });
  }
});

// Generic webhook endpoint for other services
router.post('/generic', (req, res) => {
  try {
    console.log('📨 Received generic webhook:', req.body);
    
    const messageData = {
      text: req.body.message || req.body.text || JSON.stringify(req.body),
      sender: req.body.sender || req.body.from || 'External Service',
      source: req.body.source || 'webhook',
      timestamp: new Date().toISOString(),
      id: Date.now() + Math.random()
    };

    // Add message to storage
    const message = messageService.addMessage(messageData);
    
    // Broadcast to all connected clients
    if (req.socketController) {
      req.socketController.broadcastExternalMessage(message);
    }
    
    res.json({ 
      success: true, 
      message: 'Webhook processed successfully',
      id: message.id
    });
    
  } catch (error) {
    console.error('❌ Error processing generic webhook:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process webhook'
    });
  }
});

// System webhook for admin messages
router.post('/system', (req, res) => {
  try {
    const adminKey = req.headers['x-admin-key'] || req.body.adminKey;
    
    // Simple admin authentication
    if (adminKey !== process.env.ADMIN_KEY && process.env.NODE_ENV === 'production') {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }
    
    console.log('📨 Received system webhook:', req.body);
    
    const messageData = {
      text: req.body.message || req.body.text || 'System message',
      sender: 'Sistema',
      source: 'system',
      timestamp: new Date().toISOString(),
      id: Date.now() + Math.random()
    };

    // Add system message and broadcast to all connected clients
    let message;
    if (req.socketController) {
      req.socketController.broadcastSystemMessage(messageData.text);
      // Get the message that was added by broadcastSystemMessage
      const messages = messageService.getMessages();
      message = messages[messages.length - 1];
    } else {
      // Fallback if no socketController
      message = messageService.addSystemMessage(messageData.text);
    }
    
    res.json({ 
      success: true, 
      message: 'System message sent',
      id: message.id
    });
    
  } catch (error) {
    console.error('❌ Error processing system webhook:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process system webhook'
    });
  }
});

module.exports = router;