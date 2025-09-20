// Initialize Socket.IO connection
const socket = io();

// DOM elements
const messagesContainer = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const senderInput = document.getElementById('senderName');
const sendButton = document.getElementById('sendButton');
const sendToN8nCheckbox = document.getElementById('sendToN8n');

// Message handling
function displayMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${message.source || 'other'}`;
    
    const timestamp = new Date(message.timestamp).toLocaleTimeString();
    
    messageDiv.innerHTML = `
        <div class="message-header">
            <span><strong>${message.sender}</strong></span>
            <span>${timestamp}</span>
        </div>
        <div class="message-text">${escapeHtml(message.text)}</div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function sendMessage() {
    const text = messageInput.value.trim();
    const sender = senderInput.value.trim() || 'Anonymous';
    
    if (!text) return;
    
    const messageData = {
        text: text,
        sender: sender,
        sendToN8n: sendToN8nCheckbox.checked
    };
    
    // Send message via Socket.IO
    socket.emit('send_message', messageData);
    
    // Clear input
    messageInput.value = '';
    messageInput.focus();
}

// Event listeners
sendButton.addEventListener('click', sendMessage);

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Socket.IO event listeners
socket.on('connect', () => {
    console.log('Connected to server');
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
});

socket.on('message', (message) => {
    displayMessage(message);
});

socket.on('chat_history', (messages) => {
    messages.forEach(message => {
        displayMessage(message);
    });
});

// Focus on message input when page loads
window.addEventListener('load', () => {
    messageInput.focus();
});

// API functions for direct HTTP requests (alternative to Socket.IO)
async function sendToN8nDirect(message) {
    try {
        const response = await fetch('/api/send-to-n8n', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message)
        });
        
        const result = await response.json();
        console.log('Message sent to n8n:', result);
        return result;
    } catch (error) {
        console.error('Error sending to n8n:', error);
        throw error;
    }
}

async function loadChatHistory() {
    try {
        const response = await fetch('/api/messages');
        const messages = await response.json();
        
        messagesContainer.innerHTML = '';
        messages.forEach(message => {
            displayMessage(message);
        });
    } catch (error) {
        console.error('Error loading chat history:', error);
    }
}

// Expose functions globally for debugging
window.chatApp = {
    sendToN8nDirect,
    loadChatHistory,
    socket
};