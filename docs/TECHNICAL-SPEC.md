# Chatinho - Technical Specification

## Overview

Chatinho is a real-time chat application with n8n webhook integration built on Node.js, Express, and Socket.IO. It provides bidirectional communication between users and n8n workflows, enabling automated responses and workflow triggers.

## Architecture

### System Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   n8n           │
│   (Browser)     │◄──►│   (Node.js)     │◄──►│   (Webhook)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
    Socket.IO              REST API/              Webhook
    Real-time              WebSocket               HTTP POST
```

### Directory Structure

```
chatinho/
├── src/                     # Source code
│   ├── config/             # Configuration management
│   ├── controllers/        # Socket.IO and business logic
│   ├── middleware/         # Custom middleware functions
│   ├── routes/             # HTTP route handlers
│   ├── services/           # Business services (n8n, messages)
│   └── utils/              # Utility functions
├── assets/                 # Static assets
│   ├── css/                # Stylesheets
│   ├── js/                 # Client-side JavaScript
│   └── images/             # Images and icons
├── public/                 # Public web files
├── tests/                  # Test files
├── scripts/                # Development and build scripts
├── docs/                   # Documentation
└── [config files]         # Package.json, .env, etc.
```

## Core Components

### 1. Configuration (`src/config/`)

**Purpose**: Centralized configuration management with environment validation.

**Key Features**:
- Environment variable validation
- Default values and type conversion
- Development/production configuration differences
- Runtime configuration validation

**Configuration Sections**:
- Server settings (port, environment)
- n8n webhook configuration
- Socket.IO settings
- Application limits and timeouts

### 2. Message Service (`src/services/messageService.js`)

**Purpose**: Message storage, retrieval, and lifecycle management.

**Key Features**:
- In-memory message storage with configurable limits
- Message categorization (client, n8n, system)
- Automatic cleanup of old messages
- Message statistics and analytics
- Thread-safe operations

**API Methods**:
- `addMessage(data)` - Store new message
- `addN8nResponse(data)` - Store n8n response
- `getMessages(limit)` - Retrieve recent messages
- `clearMessages()` - Clear all messages
- `getStats()` - Get message statistics

### 3. n8n Service (`src/services/n8nService.js`)

**Purpose**: Handle all communication with n8n workflows.

**Key Features**:
- HTTP webhook communication
- Automatic retry logic with exponential backoff
- Request/response formatting
- Connection testing
- Error handling and logging

**API Methods**:
- `sendMessage(message)` - Send message to n8n
- `testConnection()` - Test webhook connectivity
- `formatPayload(data)` - Format data for n8n
- `processResponse(response)` - Process n8n response

### 4. Socket Controller (`src/controllers/socketController.js`)

**Purpose**: Manage Socket.IO connections and real-time communication.

**Key Features**:
- Connection lifecycle management
- Real-time message broadcasting
- User session tracking
- Event handling (typing, disconnect)
- Message history for new connections

**Event Handlers**:
- `connection` - New user connection
- `message` - Incoming message from client
- `typing` / `stop_typing` - Typing indicators
- `disconnect` - User disconnection

### 5. API Routes (`src/routes/api.js`)

**Purpose**: HTTP endpoints for REST API functionality.

**Endpoints**:
- `GET /api/messages` - Retrieve message history
- `POST /api/send-to-n8n` - Send message to n8n directly
- `GET /api/test-n8n` - Test n8n connection
- `GET /api/stats` - Application statistics
- `DELETE /api/messages` - Clear messages (admin)
- `GET /api/health` - Health check

### 6. Webhook Routes (`src/routes/webhooks.js`)

**Purpose**: Handle incoming webhooks from external services.

**Endpoints**:
- `POST /webhook/n8n` - Receive messages from n8n
- `POST /webhook/generic` - Generic webhook handler
- `POST /webhook/system` - System messages (admin)

### 7. Middleware (`src/middleware/`)

**Custom Middleware Functions**:
- Request logging and performance monitoring
- Error handling and formatting
- CORS configuration
- Rate limiting
- Security headers
- Request validation

### 8. Utilities (`src/utils/helpers.js`)

**Helper Functions**:
- ID generation and timestamps
- Message validation and sanitization
- Error formatting and logging
- Performance timing
- Environment helpers
- Retry mechanisms

## Data Flow

### Message Flow Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────►│   Server    │────►│     n8n     │
│  (Browser)  │     │ (Socket.IO) │     │ (Webhook)   │
└─────────────┘     └─────────────┘     └─────────────┘
       ▲                     │                   │
       │                     ▼                   ▼
       │            ┌─────────────┐     ┌─────────────┐
       │            │  Message    │     │  Response   │
       │            │  Service    │     │ Processing  │
       │            └─────────────┘     └─────────────┘
       │                     │                   │
       │                     ▼                   │
       │            ┌─────────────┐              │
       └────────────│ Broadcast   │◄─────────────┘
                    │ to Clients  │
                    └─────────────┘
```

### 1. Client Message Flow

1. User types message in browser
2. Client validates and sends via Socket.IO
3. Server receives and stores message
4. Server broadcasts to all connected clients
5. If "Send to n8n" enabled, server forwards to n8n
6. n8n processes and may respond via webhook
7. Server broadcasts n8n response to all clients

### 2. n8n Webhook Flow

1. n8n workflow triggers webhook POST
2. Server receives webhook payload
3. Server formats and stores message
4. Server broadcasts message to all clients
5. Clients display n8n message with special styling

## API Specification

### Socket.IO Events

**Client to Server**:
- `message` - Send new message
- `typing` - User is typing
- `stop_typing` - User stopped typing
- `request_history` - Request message history

**Server to Client**:
- `message` - New message broadcast
- `recent_messages` - Message history on connect
- `user_typing` - Another user is typing
- `user_disconnected` - User left chat
- `error` - Error message

### REST API Endpoints

#### GET /api/messages
Retrieve chat message history.

**Query Parameters**:
- `limit` (number, optional) - Maximum messages to return (default: 50)

**Response**:
```json
{
  "success": true,
  "messages": [
    {
      "id": "unique_id",
      "text": "Hello world",
      "sender": "John",
      "timestamp": "2025-09-20T18:30:00.000Z",
      "source": "client"
    }
  ],
  "total": 1
}
```

#### POST /api/send-to-n8n
Send message directly to n8n webhook.

**Request Body**:
```json
{
  "text": "Hello n8n",
  "sender": "API User",
  "timestamp": "2025-09-20T18:30:00.000Z"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Message sent to n8n successfully",
  "response": "n8n response data"
}
```

#### GET /api/health
Application health check.

**Response**:
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2025-09-20T18:30:00.000Z",
  "uptime": 3600,
  "memory": {
    "rss": 45108672,
    "heapTotal": 18382848,
    "heapUsed": 10553632
  }
}
```

### Webhook Endpoints

#### POST /webhook/n8n
Receive messages from n8n workflows.

**Request Body**:
```json
{
  "message": "Hello from n8n",
  "sender": "Alice (n8n)",
  "timestamp": "2025-09-20T18:30:00.000Z"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Message received and broadcasted",
  "id": "message_id"
}
```

## Security Considerations

### 1. Input Validation
- All user inputs sanitized and validated
- Message length limits enforced
- XSS prevention in message display
- SQL injection prevention (when database is added)

### 2. Rate Limiting
- Basic rate limiting middleware implemented
- Configurable limits per IP address
- Protection against spam and DoS attacks

### 3. Authentication
- Admin endpoints require API key
- Environment-based security levels
- CORS configuration for cross-origin requests

### 4. Environment Security
- Sensitive data in environment variables
- Production vs development configurations
- Security headers in production

## Performance Considerations

### 1. Memory Management
- Message storage limits to prevent memory leaks
- Automatic cleanup of old messages
- Connection tracking and cleanup

### 2. Scalability
- Stateless design for horizontal scaling
- In-memory storage can be replaced with database
- Socket.IO clustering support available

### 3. Error Handling
- Comprehensive try-catch blocks
- Graceful degradation on n8n failures
- Client-side error recovery

## Deployment

### Environment Variables

**Required**:
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 3000)

**Optional**:
- `N8N_WEBHOOK_URL` - n8n webhook endpoint
- `ADMIN_KEY` - Admin API authentication

### Production Checklist

1. **Environment Setup**:
   - Copy `.env.production.example` to `.env`
   - Configure all required environment variables
   - Set `NODE_ENV=production`

2. **Security**:
   - Configure ADMIN_KEY for admin endpoints
   - Set up HTTPS in production
   - Configure firewall rules

3. **Monitoring**:
   - Monitor `/api/health` endpoint
   - Set up logging aggregation
   - Monitor memory usage and connections

4. **Performance**:
   - Configure reverse proxy (nginx/Apache)
   - Set up process manager (PM2)
   - Enable gzip compression

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## Testing

### Test Categories

1. **Unit Tests**: Individual component testing
2. **Integration Tests**: API endpoint testing
3. **Socket Tests**: Real-time communication testing
4. **End-to-End Tests**: Full user flow testing

### Running Tests

```bash
# Run all tests
npm run test

# Run specific test suite
node scripts/test.js

# Manual testing
node tests/test-send-button.js
powershell tests/test-webhook.ps1
```

## Development

### Getting Started

1. Clone repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env`
4. Configure n8n webhook URL
5. Start development server: `npm run dev`

### Development Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run test` - Run test suite
- `npm start` - Start production server

### Code Style

- ESLint configuration for code quality
- Consistent error handling patterns
- Comprehensive logging and debugging
- JSDoc comments for all functions

## Future Enhancements

### Planned Features

1. **Database Integration**:
   - Persistent message storage
   - User authentication and profiles
   - Message search and filtering

2. **Advanced Features**:
   - File upload and sharing
   - Message reactions and replies
   - Chat rooms and channels

3. **Security Enhancements**:
   - JWT authentication
   - Role-based access control
   - Message encryption

4. **Performance Improvements**:
   - Message pagination
   - Connection pooling
   - Caching layer

5. **Integration Enhancements**:
   - Multiple webhook sources
   - Plugin architecture
   - API rate limiting per user

## Troubleshooting

See [WEBHOOK-TROUBLESHOOTING.md](./WEBHOOK-TROUBLESHOOTING.md) for detailed troubleshooting information.

### Common Issues

1. **n8n Connection Issues**: Check webhook URL and network connectivity
2. **Socket.IO Connection Problems**: Verify CORS configuration
3. **Memory Issues**: Check message retention settings
4. **Performance Problems**: Monitor connection count and message volume

## Support and Maintenance

### Monitoring Endpoints

- Health Check: `GET /api/health`
- Statistics: `GET /api/stats`
- n8n Test: `GET /api/test-n8n`

### Logging

- Structured logging with timestamps
- Different log levels (info, warn, error)
- Request/response logging
- Performance metrics

### Backup and Recovery

- Export message history via API
- Configuration backup (environment variables)
- Database backup procedures (when implemented)