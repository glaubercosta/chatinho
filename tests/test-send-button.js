// Teste do botão SEND - Verificação de webhook n8n
console.log('🔍 Testando integração do botão SEND com webhook n8n...');

// Simular evento Socket.IO como se fosse do frontend
const io = require('socket.io-client');

const socket = io('http://localhost:3002');

socket.on('connect', () => {
    console.log('✅ Conectado ao servidor Socket.IO');
    
    // Simular clique no botão SEND com checkbox "Send to n8n" marcado
    const testMessage = {
        text: "Teste do botão SEND - Esta mensagem deve ir para o n8n!",
        sender: "Teste Automatizado",
        sendToN8n: true  // Esta é a propriedade crítica
    };
    
    console.log('📤 Enviando mensagem de teste...', testMessage);
    socket.emit('send_message', testMessage);
    
    // Aguardar um pouco e desconectar
    setTimeout(() => {
        console.log('🏁 Teste concluído');
        socket.disconnect();
        process.exit(0);
    }, 2000);
});

socket.on('message', (message) => {
    console.log('📨 Mensagem recebida via Socket.IO:', message);
});

socket.on('disconnect', () => {
    console.log('🔌 Desconectado do servidor');
});

socket.on('connect_error', (error) => {
    console.error('❌ Erro de conexão:', error);
    process.exit(1);
});