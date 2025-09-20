// Initialize Socket.IO connection
console.log('Initializing Socket.IO...');
const socket = io();
console.log('Socket.IO initialized:', socket);

// DOM elements
const messagesContainer = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const senderInput = document.getElementById('senderName');
const sendButton = document.getElementById('sendButton');
const sendToN8nCheckbox = document.getElementById('sendToN8n');
const statusIndicator = document.getElementById('statusIndicator');
const settingsContent = document.getElementById('settingsContent');

// Settings toggle function
function toggleSettings() {
    const toggle = document.querySelector('.settings-toggle');
    const content = document.getElementById('settingsContent');
    
    toggle.classList.toggle('active');
    content.classList.toggle('active');
}

// Message handling with WhatsApp-style display
function displayMessage(message) {
    console.log('displayMessage called with:', message);
    
    // Get fresh reference to messages container
    const container = document.getElementById('messages');
    if (!container) {
        console.error('Messages container not found!');
        return;
    }
    
    if (!message || !message.text) {
        console.error('Invalid message:', message);
        return;
    }
    
    try {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.source || 'other'}`;
        
        const timestamp = new Date(message.timestamp || Date.now()).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // For client messages, don't show sender name in header
        const showSender = message.source !== 'client';
        
        messageDiv.innerHTML = `
            ${showSender ? `<div class="message-header">
                <span>${escapeHtml(message.sender || 'Unknown')}</span>
            </div>` : ''}
            <div class="message-text">${escapeHtml(message.text)}</div>
            <div class="message-time">${timestamp}</div>
        `;
        
        console.log('Appending message to container. Current children:', container.children.length);
        container.appendChild(messageDiv);
        container.scrollTop = container.scrollHeight;
        
        console.log('Message appended successfully. New children count:', container.children.length);
        
    } catch (error) {
        console.error('Error in displayMessage:', error);
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function sendMessage() {
    const text = messageInput.value.trim();
    const sender = senderInput.value.trim() || 'Você';
    
    if (!text) return;
    
    const messageData = {
        text: text,
        sender: sender,
        sendToN8n: sendToN8nCheckbox.checked
    };
    
    console.log('Sending message:', messageData);
    
    // Send message via Socket.IO
    socket.emit('send_message', messageData);
    
    // Clear input and focus
    messageInput.value = '';
    messageInput.focus();
    
    // Animate send button
    sendButton.style.transform = 'scale(0.95)';
    setTimeout(() => {
        sendButton.style.transform = 'scale(1)';
    }, 100);
}

// Track if we're waiting for a response
let waitingForResponse = false;

// Event listeners
sendButton.addEventListener('click', () => {
    if (sendToN8nCheckbox.checked) {
        waitingForResponse = true;
        // Show typing indicator after a brief delay
        setTimeout(() => {
            if (waitingForResponse) {
                showTypingIndicator(true);
            }
        }, 800);
    }
    sendMessage();
});

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        if (sendToN8nCheckbox.checked) {
            waitingForResponse = true;
            // Show typing indicator after a brief delay
            setTimeout(() => {
                if (waitingForResponse) {
                    showTypingIndicator(true);
                }
            }, 800);
        }
        sendMessage();
    }
});

// Socket.IO event listeners
socket.on('connect', () => {
    console.log('Connected to server');
    updateStatus('online');
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
    updateStatus('offline');
});

socket.on('message', (message) => {
    console.log('Received message:', message);
    
    // Clear waiting state and remove typing indicator
    if (message.source === 'n8n' || message.source === 'other' || message.source === 'system') {
        waitingForResponse = false;
        showTypingIndicator(false);
    }
    
    // Display the message
    displayMessage(message);
});

socket.on('chat_history', (messages) => {
    console.log('Loading chat history:', messages.length, 'messages');
    
    // Clear existing messages except date separator
    const dateSeperator = messagesContainer.querySelector('.date-separator');
    messagesContainer.innerHTML = '';
    if (dateSeperator) {
        messagesContainer.appendChild(dateSeperator);
    }
    
    messages.forEach(message => {
        displayMessage(message);
    });
});

// Status and typing indicators
function updateStatus(status) {
    if (statusIndicator) {
        statusIndicator.textContent = status === 'online' ? 'online' : 'offline';
        statusIndicator.style.color = status === 'online' ? '#25d366' : '#8696a0';
    }
}

function showTypingIndicator(show) {
    let typingDiv = document.querySelector('.typing-indicator');
    
    if (show && !typingDiv) {
        typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="message other">
                <div class="message-text">
                    <span class="typing-dots">
                        <span></span><span></span><span></span>
                    </span>
                    digitando...
                </div>
            </div>
        `;
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    } else if (!show && typingDiv) {
        typingDiv.remove();
    }
}

// Enhanced input handling
messageInput.addEventListener('input', () => {
    // Auto-resize if needed (for future multiline support)
    messageInput.style.height = 'auto';
    messageInput.style.height = messageInput.scrollHeight + 'px';
});

// Focus on message input when page loads
window.addEventListener('load', () => {
    messageInput.focus();
    loadChatHistory();
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
        
        // Keep date separator, clear rest
        const dateSeparator = messagesContainer.querySelector('.date-separator');
        messagesContainer.innerHTML = '';
        if (dateSeparator) {
            messagesContainer.appendChild(dateSeparator);
        }
        
        messages.forEach(message => {
            displayMessage(message);
        });
    } catch (error) {
        console.error('Error loading chat history:', error);
    }
}

// Add CSS for typing indicator animation
const style = document.createElement('style');
style.textContent = `
    .typing-dots {
        display: inline-flex;
        gap: 2px;
        margin-right: 6px;
    }
    
    .typing-dots span {
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background: #8696a0;
        animation: typingDots 1.4s infinite ease-in-out;
    }
    
    .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
    .typing-dots span:nth-child(2) { animation-delay: -0.16s; }
    
    @keyframes typingDots {
        0%, 80%, 100% {
            transform: scale(0);
            opacity: 0.5;
        }
        40% {
            transform: scale(1);
            opacity: 1;
        }
    }
    
    .typing-indicator {
        margin-bottom: 8px;
    }
`;
document.head.appendChild(style);

// Make toggle function globally available
window.toggleSettings = toggleSettings;

// Expose functions globally for debugging
window.chatApp = {
    sendToN8nDirect,
    loadChatHistory,
    toggleSettings,
    socket
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded');
    console.log('Messages container ready:', !!document.getElementById('messages'));
});