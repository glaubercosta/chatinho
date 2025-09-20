# Chatinho - AI Coding Agent Instructions

## Project Overview

Chatinho is a real-time chat application with n8n webhook integration. It uses Node.js/Express backend with Socket.IO for real-time communication and a responsive web frontend.

## Architecture

- **Backend**: `server.js` - Express server with Socket.IO and webhook endpoints
- **Frontend**: `public/` - Static files (HTML/CSS/JS) with Socket.IO client
- **Integration**: Bidirectional n8n webhook communication

## Key Development Patterns

### Server Architecture
- Socket.IO for real-time messaging (`io.emit('message', data)`)
- REST API for webhook integration (`POST /webhook/n8n`)
- In-memory message storage (extend to database for production)
- Environment-based configuration (`.env` file)

### Message Flow
1. Client sends via Socket.IO → Server broadcasts to all clients
2. n8n sends to `/webhook/n8n` → Server broadcasts to clients
3. Optional: Client messages forwarded to n8n webhook URL
4. **NEW**: n8n responses automatically displayed in chat as "Alice (n8n)" messages

### Frontend Patterns
- Socket.IO event handling (`socket.on('message', displayMessage)`)
- Dynamic message rendering with timestamps and sender info
- Message source styling (client vs n8n vs other)

## Essential Commands

```bash
npm run dev          # Start development server with nodemon
npm start           # Start production server
npm install         # Install dependencies
```

## Configuration

- Copy `.env.example` to `.env`
- Set `N8N_WEBHOOK_URL` for outbound n8n integration
- Server runs on `PORT` (default: 3000)

## n8n Integration Points

**Incoming**: `POST /webhook/n8n` expects `{message, sender}` payload
**Outgoing**: Messages sent to `http://192.168.252.50:5678/webhook/chat_glauber`
- **Format**: `{"text": "message", "id": "12345", "sender": "user", "timestamp": "ISO"}`
- **Triggered**: When "Send to n8n" checkbox is enabled

## File Structure

```
server.js           # Main server with Socket.IO and webhook handling
public/
├── index.html      # Chat UI with Socket.IO client
├── style.css       # Responsive chat styling
└── script.js       # Client-side Socket.IO and message handling
```

## Development Notes

- Messages stored in `messages[]` array (temporary)
- Socket.IO handles real-time updates automatically
- CORS enabled for webhook integration
- Use `nodemon` for auto-reload during development