# Chatinho - Professional Chat Application

A real-time chat application with n8n webhook integration, built with modern Node.js architecture and Socket.IO for seamless real-time communication.

## 🚀 Features

- **Real-time Messaging**: Instant communication using Socket.IO
- **n8n Integration**: Bidirectional webhook communication with n8n workflows
- **Professional Architecture**: Modular, scalable codebase with separation of concerns
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Message Persistence**: Configurable in-memory storage with automatic cleanup
- **Comprehensive API**: Full REST API with health checks and statistics
- **Development Tools**: Built-in testing, building, and development scripts
- **Production Ready**: Environment-based configuration and security features

## 📋 Quick Start

### Prerequisites

- Node.js 16+ 
- npm or yarn
- n8n instance (optional, for webhook integration)

### Installation

1. **Clone and install:**
   ```bash
   git clone <repository-url>
   cd chatinho
   npm install
   ```

2. **Configure environment:**
   ```bash
   copy .env.example .env
   # Edit .env with your configuration
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3002`

## 🏗️ Architecture

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
├── assets/                 # Static assets (CSS, JS, images)
├── public/                 # Public web files
├── tests/                  # Test files and scripts
├── scripts/                # Development and build scripts
├── docs/                   # Documentation
└── [config files]         # Package.json, .env, etc.
```

### Core Components

- **Message Service**: Handles message storage, retrieval, and cleanup
- **n8n Service**: Manages webhook communication with n8n workflows
- **Socket Controller**: Manages real-time Socket.IO connections
- **API Routes**: RESTful endpoints for chat functionality
- **Webhook Routes**: Handles incoming webhooks from external services

## 🔧 Configuration

### Environment Variables

**Required:**
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 3002)

**Optional:**
- `N8N_WEBHOOK_URL` - n8n webhook endpoint for outbound messages
- `ADMIN_KEY` - Admin API authentication key
- `MAX_MESSAGES` - Maximum messages to store (default: 1000)
- `MESSAGE_RETENTION_HOURS` - Message retention period (default: 24)

### Example Configuration

```bash
# .env file
NODE_ENV=development
PORT=3002
N8N_WEBHOOK_URL=http://192.168.252.50:5678/webhook/chat_glauber
ADMIN_KEY=your_secure_admin_key
MAX_MESSAGES=1000
MESSAGE_RETENTION_HOURS=24
```

## 🤖 n8n Integration

### Outbound Messages (Chat → n8n)

When users enable "Send to n8n", messages are forwarded to your n8n webhook:

**Payload format:**
```json
{
  "text": "User message",
  "id": "unique_message_id",
  "sender": "Username",
  "timestamp": "2025-09-20T18:30:00.000Z"
}
```

### Inbound Messages (n8n → Chat)

n8n workflows can send messages to the chat:

**Endpoint:** `POST http://localhost:3002/webhook/n8n`

**Payload:**
```json
{
  "message": "Hello from n8n workflow!",
  "sender": "Alice (n8n)"
}
```

## 📡 API Reference

### REST Endpoints

- `GET /api/health` - Application health check
- `GET /api/messages` - Retrieve message history
- `GET /api/stats` - Application statistics
- `POST /api/send-to-n8n` - Send message directly to n8n
- `GET /api/test-n8n` - Test n8n connection
- `DELETE /api/messages` - Clear all messages (admin)

### WebSocket Events

**Client → Server:**
- `message` - Send new message
- `typing` - User typing indicator
- `request_history` - Request message history

**Server → Client:**
- `message` - New message broadcast
- `chat_history` - Message history for new connections
- `user_typing` - Typing indicators from other users

### Webhook Endpoints

- `POST /webhook/n8n` - Receive messages from n8n
- `POST /webhook/generic` - Generic webhook handler
- `POST /webhook/system` - System messages (admin)

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start with hot reload
node scripts/dev.js  # Enhanced development startup

# Testing  
npm run test         # Run all tests
node scripts/test.js # Comprehensive test suite

# Production
npm run build        # Build for production
npm start           # Start production server
```

### Development Tools

- **Enhanced Dev Server**: Environment validation and health checks
- **Comprehensive Testing**: Automated test suite with environment validation
- **Build Scripts**: Production preparation and deployment information
- **Code Quality**: ESLint configuration and consistent patterns

## 🧪 Testing

### Running Tests

```bash
# Run comprehensive test suite
npm run test

# Manual testing
node tests/test-send-button.js
powershell tests/test-webhook.ps1
```

### Test Coverage

- Environment validation
- File structure verification
- Module loading tests
- n8n webhook connectivity
- Server startup validation

## 🚀 Production Deployment

### Build for Production

```bash
# Prepare production build
npm run build

# This creates:
# - .env.production.example
# - deployment-info.json
# - Validates all dependencies
```

### Deployment Steps

1. **Prepare Environment:**
   ```bash
   NODE_ENV=production
   PORT=3000
   N8N_WEBHOOK_URL=your_production_webhook
   ADMIN_KEY=secure_production_key
   ```

2. **Deploy Application:**
   ```bash
   # Install production dependencies
   npm ci --only=production
   
   # Start with PM2 (recommended)
   npm install -g pm2
   pm2 start server.js --name chatinho
   ```

3. **Verify Deployment:**
   ```bash
   curl http://localhost:3000/api/health
   ```

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

## 📖 Documentation

- **[Technical Specification](docs/TECHNICAL-SPEC.md)** - Detailed architecture and implementation
- **[API Documentation](docs/API.md)** - Complete API reference with examples
- **[Troubleshooting Guide](docs/WEBHOOK-TROUBLESHOOTING.md)** - Common issues and solutions

## 🔒 Security Features

- Input validation and sanitization
- Rate limiting protection
- Admin authentication for sensitive endpoints
- Environment-based security configurations
- XSS prevention in message display
- CORS configuration for cross-origin requests

## 📊 Monitoring

### Health Monitoring

```bash
# Check application health
curl http://localhost:3002/api/health

# Get application statistics
curl http://localhost:3002/api/stats
```

### Performance Metrics

- Memory usage tracking
- Connection count monitoring
- Message throughput statistics
- Response time measurements

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm run test`
5. Submit a pull request

## 📝 Changelog

### v2.0.0 - Professional Refactor

- ✅ Complete modular architecture
- ✅ Professional directory structure
- ✅ Comprehensive testing suite
- ✅ Enhanced development tools
- ✅ Production-ready configuration
- ✅ Complete documentation

### v1.0.0 - Initial Release

- Basic chat functionality
- n8n webhook integration
- Real-time messaging

## 🆘 Support

### Common Issues

1. **n8n Connection Failed**: Verify webhook URL and network connectivity
2. **Socket.IO Errors**: Check CORS configuration and client connections
3. **Memory Issues**: Monitor message retention settings and cleanup
4. **Performance Problems**: Check connection count and message volume

### Getting Help

- Check the [Troubleshooting Guide](docs/WEBHOOK-TROUBLESHOOTING.md)
- Review [API Documentation](docs/API.md)
- Examine server logs for detailed error information
- Use health check endpoint for system status

## 📄 License

MIT License - see LICENSE file for details.

---

**Built with ❤️ using Node.js, Express, Socket.IO, and modern development practices.**