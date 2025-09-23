/**
 * Socket.IO Controller
 * Handles all Socket.IO events and real-time communication
 */

const messageService = require('../services/messageService');
const n8nService = require('../services/n8nService');
const config = require('../config');

class SocketController {
  constructor(io) {
    this.io = io;
    this.connectedUsers = new Map();
    this.setupSocketHandlers();
  }

  /**
   * Setup Socket.IO event handlers
   */
  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      this.handleConnection(socket);
    });
  }

  /**
   * Handle new socket connection
   */
  handleConnection(socket) {
    const userId = socket.id;
    const clientIP = socket.handshake.address;
    
    console.log(`🔌 User connected: ${userId} from ${clientIP}`);
    
    // Store connection info
    this.connectedUsers.set(userId, {
      socketId: userId,
      connectedAt: new Date(),
      ip: clientIP
    });

    // Send recent messages to new connection
    this.sendRecentMessages(socket);

    // Setup event handlers for this socket
    this.setupMessageHandlers(socket);
    this.setupDisconnectionHandler(socket);
  }

  /**
   * Send recent messages to newly connected socket
   */
  sendRecentMessages(socket) {
    try {
      const recentMessages = messageService.getMessages(10); // Last 10 messages
      socket.emit('chat_history', recentMessages);
      console.log(`📜 Sent ${recentMessages.length} recent messages to ${socket.id}`);
    } catch (error) {
      console.error('❌ Error sending recent messages:', error);
    }
  }

  /**
   * Setup message-related event handlers
   */
  setupMessageHandlers(socket) {
    // Handle incoming messages
    socket.on('message', async (data) => {
      await this.handleMessage(socket, data);
    });

    // Handle send_message events (from client)
    socket.on('send_message', async (data) => {
      await this.handleMessage(socket, data);
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
      this.handleTyping(socket, data);
    });

    // Handle stop typing
    socket.on('stop_typing', (data) => {
      this.handleStopTyping(socket, data);
    });

    // Handle user info updates
    socket.on('user_info', (data) => {
      this.handleUserInfo(socket, data);
    });

    // Handle message history request
    socket.on('request_history', (data) => {
      this.handleHistoryRequest(socket, data);
    });
  }

  /**
   * Handle incoming message
   */
  async handleMessage(socket, data) {
    try {
      console.log('📝 Received message:', data);

      // Validate message data
      if (!data || (!data.message && !data.text) || !data.sender) {
        socket.emit('error', { message: 'Invalid message format' });
        return;
      }

      // Create message object
      const messageData = {
        text: data.text || data.message,
        sender: data.sender,
        timestamp: new Date().toISOString(),
        id: this.generateMessageId(),
        source: 'client'
      };

      // Store message
      messageService.addMessage(messageData);

      // Broadcast to all clients
      this.io.emit('message', messageData);
      console.log('📡 Message broadcasted to all clients');

      // Send to n8n if requested
      if (data.sendToN8n) {
        await this.sendToN8n(messageData);
      }

    } catch (error) {
      console.error('❌ Error handling message:', error);
      socket.emit('error', { message: 'Failed to process message' });
    }
  }

  /**
   * Send message to n8n webhook
   */
  async sendToN8n(messageData) {
    try {
      console.log('🤖 Sending message to n8n...');
      const response = await n8nService.sendMessage(messageData);
      
      if (response && response.success) {
        console.log('✅ Message sent to n8n successfully');
        
        // If n8n responds immediately, broadcast the response
        if (response.data && response.data.text) {
          const n8nResponse = {
            text: response.data.text,
            sender: response.data.sender || 'Alice (n8n)',
            timestamp: response.data.timestamp || new Date().toISOString(),
            id: response.data.id || this.generateMessageId(),
            source: 'n8n'
          };

          messageService.addN8nResponse(n8nResponse);
          this.io.emit('message', n8nResponse);
          console.log('📡 n8n response broadcasted');
        }
      } else {
        console.error('❌ Failed to send message to n8n:', response ? response.error : 'No response');
      }
    } catch (error) {
      console.error('❌ Error sending to n8n:', error);
    }
  }

  /**
   * Handle typing indicator
   */
  handleTyping(socket, data) {
    socket.broadcast.emit('user_typing', {
      userId: socket.id,
      sender: data.sender || 'Anonymous',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Handle stop typing
   */
  handleStopTyping(socket, data) {
    socket.broadcast.emit('user_stop_typing', {
      userId: socket.id,
      sender: data.sender || 'Anonymous',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Handle user info updates
   */
  handleUserInfo(socket, data) {
    const userInfo = this.connectedUsers.get(socket.id);
    if (userInfo) {
      userInfo.name = data.name || 'Anonymous';
      userInfo.lastActivity = new Date();
      this.connectedUsers.set(socket.id, userInfo);
    }
  }

  /**
   * Handle message history request
   */
  handleHistoryRequest(socket, data) {
    try {
      const limit = Math.min(data.limit || 50, 100); // Max 100 messages
      const messages = messageService.getMessages(limit);
      socket.emit('message_history', messages);
      console.log(`📜 Sent ${messages.length} messages to ${socket.id}`);
    } catch (error) {
      console.error('❌ Error sending message history:', error);
      socket.emit('error', { message: 'Failed to load message history' });
    }
  }

  /**
   * Setup disconnection handler
   */
  setupDisconnectionHandler(socket) {
    socket.on('disconnect', (reason) => {
      console.log(`🔌 User disconnected: ${socket.id} (${reason})`);
      
      // Remove from connected users
      this.connectedUsers.delete(socket.id);
      
      // Notify other users
      socket.broadcast.emit('user_disconnected', {
        userId: socket.id,
        timestamp: new Date().toISOString(),
        reason
      });
    });
  }

  /**
   * Broadcast message from external source (like webhook)
   */
  broadcastExternalMessage(messageData) {
    try {
      // Store message
      messageService.addN8nResponse(messageData);
      
      // Broadcast to all connected clients
      this.io.emit('message', messageData);
      
      console.log('📡 External message broadcasted:', messageData.sender);
    } catch (error) {
      console.error('❌ Error broadcasting external message:', error);
    }
  }

  /**
   * Broadcast system message
   */
  broadcastSystemMessage(message) {
    try {
      const systemMessage = {
        text: message,
        sender: 'Sistema',
        timestamp: new Date().toISOString(),
        id: this.generateMessageId(),
        source: 'system'
      };

      messageService.addSystemMessage(systemMessage.text);
      this.io.emit('message', systemMessage);
      
      console.log('📡 System message broadcasted');
    } catch (error) {
      console.error('❌ Error broadcasting system message:', error);
    }
  }

  /**
   * Get connection statistics
   */
  getStats() {
    return {
      connectedUsers: this.connectedUsers.size,
      totalMessages: messageService.getTotalMessages(),
      uptime: process.uptime(),
      connections: Array.from(this.connectedUsers.values()).map(user => ({
        socketId: user.socketId,
        name: user.name || 'Anonymous',
        connectedAt: user.connectedAt,
        lastActivity: user.lastActivity || user.connectedAt
      }))
    };
  }

  /**
   * Generate unique message ID
   */
  generateMessageId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }
}

module.exports = SocketController;