# Chatinho - n8n Webhook Chat Application

A real-time chat application that integrates with n8n workflows through webhooks.

## Features

- Real-time chat interface using Socket.IO
- n8n webhook integration for automated message processing
- REST API for message management
- Responsive web design
- Message history persistence (in-memory)

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env and set your N8N_WEBHOOK_URL
   ```

3. **Start the server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

## n8n Integration

### Receiving Messages from n8n

Configure your n8n workflow to send POST requests to:
```
http://your-server:3000/webhook/n8n
```

Expected payload:
```json
{
  "message": "Hello from n8n workflow",
  "sender": "n8n Bot"
}
```

### Sending Messages to n8n

When the "Send to n8n" checkbox is enabled, messages from the chat will be forwarded to your configured n8n webhook URL.

## API Endpoints

- `GET /` - Chat interface
- `POST /webhook/n8n` - Receive messages from n8n
- `GET /api/messages` - Get chat history
- `POST /api/send-to-n8n` - Send message to n8n

## Project Structure

```
chatinho/
├── server.js          # Main server file
├── package.json       # Dependencies and scripts
├── .env.example       # Environment configuration template
├── public/            # Static web files
│   ├── index.html     # Chat interface
│   ├── style.css      # Styling
│   └── script.js      # Client-side JavaScript
└── .github/
    └── copilot-instructions.md
```

## Development

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload

## Configuration

Environment variables in `.env`:
- `PORT` - Server port (default: 3000)
- `N8N_WEBHOOK_URL` - Your n8n webhook endpoint
- `NODE_ENV` - Environment mode

## License

MIT