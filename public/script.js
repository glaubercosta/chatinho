// Socket.IO connection
const CHAT_HISTORY_EVENT = 'chat_history';
let socket;
let messagesContainer, messageInput, senderInput, sendButton, sendToN8nCheckbox, statusIndicator;

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Initializing Chatinho');
    
    // Get DOM elements
    messagesContainer = document.getElementById('messages');
    messageInput = document.getElementById('messageInput');
    senderInput = document.getElementById('senderName');
    sendButton = document.getElementById('sendButton');
    sendToN8nCheckbox = document.getElementById('sendToN8n');
    statusIndicator = document.getElementById('statusIndicator');
    
    console.log('DOM Elements:', {
        messagesContainer: !!messagesContainer,
        messageInput: !!messageInput,
        senderInput: !!senderInput,
        sendButton: !!sendButton,
        sendToN8nCheckbox: !!sendToN8nCheckbox,
        statusIndicator: !!statusIndicator
    });
    
    // Initialize Socket.IO
    initializeSocket();
    
    // Set up event listeners
    setupEventListeners();
});

function initializeSocket() {
    console.log('Initializing Socket.IO...');
    socket = io();
    
    socket.on('connect', () => {
        console.log('✅ Socket.IO connected successfully');
        updateStatus('online');
    });
    
    socket.on('disconnect', () => {
        console.log('❌ Socket.IO disconnected');
        updateStatus('offline');
    });
    
    socket.on('message', (message) => {
        console.log('📨 Received message via Socket.IO:', message);
        displayMessage(message);
    });
    
    socket.on(CHAT_HISTORY_EVENT, (messages) => {
        console.log('📜 Loading chat history:', messages.length, 'messages');
        loadChatHistory(messages);
    });
}

function setupEventListeners() {
    if (sendButton) {
        sendButton.addEventListener('click', handleSendMessage);
    }
    
    if (messageInput) {
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSendMessage();
            }
        });
    }
}

function handleSendMessage() {
    const text = messageInput?.value?.trim();
    const sender = senderInput?.value?.trim() || 'Você';
    
    if (!text) {
        console.log('Empty message, not sending');
        return;
    }
    
    const messageData = {
        text: text,
        sender: sender,
        sendToN8n: sendToN8nCheckbox?.checked || false
    };
    
    console.log('📤 Sending message:', messageData);
    
    if (socket && socket.connected) {
        socket.emit('send_message', messageData);
        messageInput.value = '';
        messageInput.focus();
    } else {
        console.error('❌ Socket not connected, cannot send message');
    }
}

function displayMessage(message) {
    console.log('🎨 Displaying message:', message);
    
    if (!messagesContainer) {
        console.error('❌ Messages container not found');
        return;
    }
    
    if (!message || !message.text) {
        console.error('❌ Invalid message:', message);
        return;
    }
    
    try {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.source || 'other'}`;
        
        const timestamp = new Date(message.timestamp || Date.now()).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const showSender = message.source !== 'client';
        
        messageDiv.innerHTML = `
            ${showSender ? `<div class="message-header">
                <span>${escapeHtml(message.sender || 'Unknown')}</span>
            </div>` : ''}
            <div class="message-text">${escapeHtml(message.text)}</div>
            <div class="message-time">${timestamp}</div>
        `;
        
        console.log('📝 Appending message to container...');
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        console.log('✅ Message displayed successfully');
        
    } catch (error) {
        console.error('❌ Error displaying message:', error);
    }
}

function loadChatHistory(messages) {
    if (!messagesContainer) return;
    
    // Clear existing messages except date separator
    const dateSeperator = messagesContainer.querySelector('.date-separator');
    messagesContainer.innerHTML = '';
    if (dateSeperator) {
        messagesContainer.appendChild(dateSeperator);
    }
    
    messages.forEach(message => {
        displayMessage(message);
    });
}

function updateStatus(status) {
    if (statusIndicator) {
        statusIndicator.textContent = status === 'online' ? 'online' : 'offline';
        statusIndicator.style.color = status === 'online' ? '#25d366' : '#8696a0';
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Settings toggle function (if needed by HTML onclick)
function toggleSettings() {
    const toggle = document.querySelector('.settings-toggle');
    const content = document.getElementById('settingsContent');
    
    if (toggle && content) {
        toggle.classList.toggle('active');
        content.classList.toggle('active');
    }
}

// Export for global access
window.toggleSettings = toggleSettings;