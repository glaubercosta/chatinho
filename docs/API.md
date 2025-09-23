# Chatinho - API Documentation

## Overview

This document provides comprehensive API documentation for the Chatinho chat application, including REST endpoints, Socket.IO events, and webhook specifications.

## Base URL

- Development: `http://localhost:3002`
- Production: `https://yourdomain.com`

## Authentication

Most endpoints are public. Admin endpoints require an API key:

```http
X-Admin-Key: your_admin_key_here
```

Or as query parameter:
```http
GET /api/endpoint?adminKey=your_admin_key_here
```

## REST API Endpoints

### Messages API

#### GET /api/messages

Retrieve chat message history.

**Parameters:**
- `limit` (optional, number): Maximum messages to return (default: 50, max: 100)

**Response:**
```json
{
  "success": true,
  "messages": [
    {
      "id": "1758392371995_abc123",
      "text": "Hello world!",
      "sender": "John",
      "timestamp": "2025-09-20T18:30:00.000Z",
      "source": "client"
    }
  ],
  "total": 1
}
```

**Example:**
```bash
curl "http://localhost:3002/api/messages?limit=10"
```

#### DELETE /api/messages

Clear all messages (Admin only).

**Headers:**
- `X-Admin-Key`: Admin authentication key

**Response:**
```json
{
  "success": true,
  "message": "All messages cleared"
}
```

**Example:**
```bash
curl -X DELETE "http://localhost:3002/api/messages" \
  -H "X-Admin-Key: your_admin_key"
```

### n8n Integration API

#### POST /api/send-to-n8n

Send message directly to n8n webhook.

**Request Body:**
```json
{
  "text": "Hello n8n",
  "sender": "API User",
  "timestamp": "2025-09-20T18:30:00.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message sent to n8n successfully",
  "response": {
    "output": "n8n response data"
  }
}
```

**Example:**
```bash
curl -X POST "http://localhost:3002/api/send-to-n8n" \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello n8n", "sender": "API"}'
```

#### GET /api/test-n8n

Test n8n webhook connection.

**Response:**
```json
{
  "success": true,
  "message": "n8n connection test successful",
  "response": "test response from n8n",
  "webhook_url": "http://192.168.252.50:5678/webhook/chat_glauber"
}
```

**Example:**
```bash
curl "http://localhost:3002/api/test-n8n"
```

### System API

#### GET /api/health

Application health check and status.

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2025-09-20T18:30:00.000Z",
  "uptime": 3600,
  "memory": {
    "rss": 45108672,
    "heapTotal": 18382848,
    "heapUsed": 10553632,
    "external": 2289760,
    "arrayBuffers": 16835
  },
  "version": "1.0.0"
}
```

**Example:**
```bash
curl "http://localhost:3002/api/health"
```

#### GET /api/stats

Application statistics and metrics.

**Response:**
```json
{
  "success": true,
  "stats": {
    "total": 25,
    "today": 15,
    "bySource": {
      "client": 12,
      "n8n": 10,
      "system": 3
    },
    "oldestMessage": "2025-09-20T10:00:00.000Z",
    "newestMessage": "2025-09-20T18:30:00.000Z"
  },
  "timestamp": "2025-09-20T18:30:00.000Z"
}
```

**Example:**
```bash
curl "http://localhost:3002/api/stats"
```

## Webhook Endpoints

### POST /webhook/n8n

Receive messages from n8n workflows.

**Request Body:**
```json
{
  "message": "Hello from n8n workflow",
  "sender": "Alice (n8n)",
  "timestamp": "2025-09-20T18:30:00.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message received and broadcasted",
  "id": "1758392371995_def456"
}
```

**Example:**
```bash
curl -X POST "http://localhost:3002/webhook/n8n" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello from n8n", "sender": "n8n Bot"}'
```

### POST /webhook/generic

Generic webhook endpoint for other services.

**Request Body:**
```json
{
  "message": "Message from external service",
  "sender": "External Service",
  "source": "webhook"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Webhook processed successfully",
  "id": "message_id"
}
```

### POST /webhook/system

System messages webhook (Admin only).

**Headers:**
- `X-Admin-Key`: Admin authentication key

**Request Body:**
```json
{
  "message": "System maintenance scheduled",
  "adminKey": "your_admin_key"
}
```

**Response:**
```json
{
  "success": true,
  "message": "System message sent",
  "id": "system_message_id"
}
```

## Socket.IO Events

### Client to Server Events

#### message

Send a new chat message.

**Payload:**
```javascript
{
  text: "Hello everyone!",
  sender: "John",
  sendToN8n: true
}
```

**Example:**
```javascript
socket.emit('message', {
  text: 'Hello world!',
  sender: 'John',
  sendToN8n: true
});
```

#### typing

Indicate user is typing.

**Payload:**
```javascript
{
  sender: "John"
}
```

#### stop_typing

Indicate user stopped typing.

**Payload:**
```javascript
{
  sender: "John"
}
```

#### request_history

Request message history.

**Payload:**
```javascript
{
  limit: 50
}
```

### Server to Client Events

#### message

New message broadcast to all clients.

**Payload:**
```javascript
{
  id: "1758392371995_abc123",
  text: "Hello world!",
  sender: "John",
  timestamp: "2025-09-20T18:30:00.000Z",
  source: "client"
}
```

#### chat_history

Message history sent to newly connected client.

**Payload:**
```javascript
[
  {
    id: "1758392371995_abc123",
    text: "Hello world!",
    sender: "John",
    timestamp: "2025-09-20T18:30:00.000Z",
    source: "client"
  }
]
```

#### user_typing

Another user is typing indicator.

**Payload:**
```javascript
{
  userId: "socket_id",
  sender: "John",
  timestamp: "2025-09-20T18:30:00.000Z"
}
```

#### user_disconnected

User left the chat.

**Payload:**
```javascript
{
  userId: "socket_id",
  timestamp: "2025-09-20T18:30:00.000Z",
  reason: "transport close"
}
```

#### error

Error message.

**Payload:**
```javascript
{
  message: "Invalid message format"
}
```

## JavaScript Client Example

```javascript
// Initialize Socket.IO connection
const socket = io();

// Listen for messages
socket.on('message', (message) => {
  console.log('New message:', message);
  displayMessage(message);
});

// Send message
function sendMessage(text, sender) {
  socket.emit('message', {
    text: text,
    sender: sender,
    sendToN8n: true
  });
}

// Listen for typing indicators
socket.on('user_typing', (data) => {
  showTypingIndicator(data.sender);
});

// Handle connection events
socket.on('connect', () => {
  console.log('Connected to chat server');
});

socket.on('disconnect', () => {
  console.log('Disconnected from chat server');
});
```

## Error Handling

### HTTP Error Responses

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error description",
  "details": "Additional error details (development only)"
}
```

### Common HTTP Status Codes

- `200` - Success
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (missing/invalid admin key)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

### Socket.IO Error Events

Socket.IO errors are sent via the `error` event:

```javascript
socket.on('error', (error) => {
  console.error('Socket error:', error.message);
});
```

## Rate Limiting

Basic rate limiting is implemented:

- Default: 100 requests per minute per IP
- Configurable via environment variables
- Returns `429 Too Many Requests` when exceeded

## CORS Configuration

CORS is configured to allow:

- All origins in development
- Configurable origins in production
- All standard HTTP methods
- Custom headers for admin authentication

## Environment Variables

### Required Variables

- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 3000)

### Optional Variables

- `N8N_WEBHOOK_URL` - n8n webhook endpoint
- `ADMIN_KEY` - Admin API authentication key
- `MAX_MESSAGES` - Maximum messages to store (default: 1000)
- `MESSAGE_RETENTION_HOURS` - Message retention period (default: 24)

## Testing API Endpoints

### Using curl

```bash
# Health check
curl "http://localhost:3002/api/health"

# Get messages
curl "http://localhost:3002/api/messages?limit=5"

# Send to n8n
curl -X POST "http://localhost:3002/api/send-to-n8n" \
  -H "Content-Type: application/json" \
  -d '{"text": "Test message", "sender": "API Test"}'

# Webhook test
curl -X POST "http://localhost:3002/webhook/n8n" \
  -H "Content-Type: application/json" \
  -d '{"message": "Test from webhook", "sender": "Test Bot"}'
```

### Using PowerShell

```powershell
# Health check
Invoke-RestMethod -Uri "http://localhost:3002/api/health"

# Send message
$body = @{
    text = "Test message"
    sender = "PowerShell"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3002/api/send-to-n8n" `
  -Method POST `
  -Body $body `
  -ContentType "application/json"
```

## WebSocket Testing

### Using JavaScript in Browser Console

```javascript
// Connect to server
const socket = io();

// Send test message
socket.emit('message', {
  text: 'Test message',
  sender: 'Browser Console',
  sendToN8n: false
});

// Listen for responses
socket.on('message', console.log);
```

## Response Times and Performance

### Expected Response Times

- API endpoints: < 100ms
- Socket.IO events: < 50ms
- n8n webhook calls: 500ms - 5s (depends on n8n workflow)

### Performance Monitoring

Monitor these endpoints for performance:

- `GET /api/health` - Server health and memory usage
- `GET /api/stats` - Message statistics and application metrics

### Memory Usage

The application tracks memory usage and provides it in the health endpoint. Monitor for:

- Heap usage increasing over time (memory leaks)
- Total memory exceeding server limits
- Message count growing without cleanup