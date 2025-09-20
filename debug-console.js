// Script de debug para testar no console do navegador
console.log('=== DEBUG SCRIPT INICIADO ===');

// Verificar elementos DOM
console.log('Messages container:', document.getElementById('messages'));
console.log('Message input:', document.getElementById('messageInput'));
console.log('Send button:', document.getElementById('sendButton'));

// Testar função displayMessage diretamente
const testMessage = {
    text: 'Teste direto no console',
    sender: 'Debug',
    source: 'client',
    timestamp: new Date().toISOString()
};

console.log('Testando displayMessage com:', testMessage);
displayMessage(testMessage);

// Verificar mensagens no container
console.log('Mensagens no container:', document.getElementById('messages').children);

// Testar envio de mensagem
function testSendMessage() {
    const messageInput = document.getElementById('messageInput');
    messageInput.value = 'Teste de envio via console';
    sendMessage();
}

console.log('Para testar envio, execute: testSendMessage()');