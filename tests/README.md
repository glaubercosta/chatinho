# Chatinho - Test Documentation

## Test-Driven Development (TDD) Implementation

Este projeto segue a metodologia TDD (Test-Driven Development) para garantir qualidade e confiabilidade do código. Os testes são organizados em uma estrutura profissional com diferentes níveis de teste.

## 📁 Estrutura de Testes

```
tests/
├── setup.js                 # Configuração global dos testes
├── helpers/
│   └── testHelpers.js       # Utilitários e mocks para testes
├── unit/                    # Testes unitários
│   ├── messageService.test.js
│   └── n8nService.test.js
├── integration/             # Testes de integração
│   ├── api.test.js
│   ├── webhook.test.js
│   └── socket.test.js
└── e2e/                     # Testes end-to-end
    └── chat.test.js
```

## 🧪 Tipos de Teste

### 1. Testes Unitários (`tests/unit/`)
- **Objetivo**: Testar funções e módulos individualmente
- **Escopo**: Serviços, utilitários, funções puras
- **Mocking**: Dependências externas são mockadas
- **Velocidade**: Rápidos (< 1s cada)

**Exemplo:**
```javascript
// messageService.test.js
describe('MessageService', () => {
  test('should add message with generated ID', () => {
    const message = messageService.addMessage({
      text: 'Test message',
      sender: 'Test User'
    });
    
    expect(message.id).toBeDefined();
    expect(message.timestamp).toBeDefined();
  });
});
```

### 2. Testes de Integração (`tests/integration/`)
- **Objetivo**: Testar interação entre componentes
- **Escopo**: APIs, webhooks, Socket.IO, banco de dados
- **Mocking**: Serviços externos (n8n) são mockados
- **Velocidade**: Moderados (1-5s cada)

**Exemplo:**
```javascript
// api.test.js
describe('API Integration', () => {
  test('should create message via POST /api/messages', async () => {
    const response = await request(app)
      .post('/api/messages')
      .send({ text: 'Test message', sender: 'Test User' })
      .expect(201);
    
    expect(response.body.message.id).toBeDefined();
  });
});
```

### 3. Testes End-to-End (`tests/e2e/`)
- **Objetivo**: Testar fluxos completos de usuário
- **Escopo**: Simulação de cenários reais
- **Mocking**: Mínimo, testa o sistema completo
- **Velocidade**: Lentos (5-30s cada)

**Exemplo:**
```javascript
// chat.test.js
describe('Complete Chat Workflow', () => {
  test('should handle user chat session with n8n integration', async () => {
    // 1. User connects
    // 2. Sends message
    // 3. Receives n8n response
    // 4. Verifies message storage
  });
});
```

## 🛠️ Ferramentas de Teste

### Framework Principal
- **Jest**: Framework de testes JavaScript
- **Configuração**: `jest.config.js` e `package.json`
- **Ambiente**: Node.js com configurações específicas

### Bibliotecas Auxiliares
- **Supertest**: Testes de API HTTP
- **Socket.IO Client**: Testes de WebSocket em tempo real
- **Nock**: Mock de chamadas HTTP externas
- **@types/jest**: Tipos TypeScript para melhor IDE support

### Helpers Personalizados
- **TestMocks**: Mocks para serviços externos (n8n)
- **TestFixtures**: Dados de teste padronizados
- **TestDatabase**: Simulação de banco de dados para testes
- **TestUtils**: Utilitários diversos (wait, validações, etc.)

## 🚀 Scripts de Teste

### Execução de Testes
```bash
# Executar todos os testes
npm test

# Executar com watch mode (desenvolvimento)
npm run test:watch

# Executar apenas testes unitários
npm run test:unit

# Executar apenas testes de integração
npm run test:integration

# Executar apenas testes e2e
npm run test:e2e

# Gerar relatório de cobertura
npm run test:coverage
```

### Relatórios de Cobertura
- **Formato**: HTML, LCOV, Text
- **Localização**: `coverage/` directory
- **Meta**: > 90% de cobertura de código

## 📋 Metodologia TDD

### Ciclo Red-Green-Refactor

1. **🔴 Red**: Escrever teste que falha
2. **🟢 Green**: Implementar código mínimo para passar
3. **🔄 Refactor**: Melhorar código mantendo testes passando

### Exemplo Prático

```javascript
// 1. RED - Teste que falha
describe('MessageService', () => {
  test('should validate message format', () => {
    expect(() => {
      messageService.addMessage({ text: '' });
    }).toThrow('Invalid message format');
  });
});

// 2. GREEN - Implementação mínima
class MessageService {
  addMessage(messageData) {
    if (!messageData.text || messageData.text.trim().length === 0) {
      throw new Error('Invalid message format');
    }
    // ... resto da implementação
  }
}

// 3. REFACTOR - Melhorar sem quebrar testes
class MessageService {
  addMessage(messageData) {
    this._validateMessage(messageData);
    return this._createMessage(messageData);
  }
  
  _validateMessage(messageData) {
    if (!messageData.text || messageData.text.trim().length === 0) {
      throw new Error('Invalid message format');
    }
  }
}
```

## 🔧 Configuração do Ambiente de Teste

### Variáveis de Ambiente
```javascript
process.env.NODE_ENV = 'test';
process.env.PORT = '3003';
process.env.N8N_WEBHOOK_URL = 'http://localhost:5678/webhook/test';
process.env.ADMIN_API_KEY = 'test-admin-key';
```

### Setup Global
- **Console mocking**: Reduz ruído nos logs
- **Timeout**: 30s para testes de integração
- **Helpers globais**: Disponíveis em todos os testes

### Limpeza Entre Testes
- **beforeEach**: Limpa mocks e dados de teste
- **afterEach**: Cleanup adicional se necessário

## 📊 Cobertura de Testes

### Metas de Cobertura
- **Statements**: > 95%
- **Branches**: > 90%
- **Functions**: > 95%
- **Lines**: > 95%

### Áreas Cobertas
- ✅ Serviços (messageService, n8nService)
- ✅ Controllers (socketController, webhookController)
- ✅ Rotas API
- ✅ Integração Socket.IO
- ✅ Webhooks externos
- ✅ Tratamento de erros
- ✅ Validações de segurança

## 🐛 Debug de Testes

### Executar Teste Específico
```bash
# Executar arquivo específico
npm test tests/unit/messageService.test.js

# Executar teste específico
npm test -- --testNamePattern="should add message"

# Debug com logs
DEBUG=* npm test
```

### Análise de Falhas
- **Jest Verbose**: `npm test -- --verbose`
- **Coverage Report**: Identifica código não testado
- **Pending Mocks**: `testMocks.getPendingMocks()`

## 📝 Boas Práticas

### Nomenclatura de Testes
- **Describe**: Descreve o que está sendo testado
- **Test**: Descreve o comportamento esperado
- **Formato**: "should [expected behavior] when [condition]"

```javascript
describe('MessageService', () => {
  describe('addMessage', () => {
    test('should generate unique ID when adding message', () => {
      // test implementation
    });
    
    test('should throw error when message text is empty', () => {
      // test implementation
    });
  });
});
```

### Organização de Dados de Teste
- **Fixtures**: Dados padronizados reutilizáveis
- **Factories**: Funções para gerar dados de teste
- **Mocks**: Simulação de dependências externas

### AAA Pattern (Arrange-Act-Assert)
```javascript
test('should add message successfully', () => {
  // Arrange - Preparar dados
  const messageData = { text: 'Test', sender: 'User' };
  
  // Act - Executar ação
  const result = messageService.addMessage(messageData);
  
  // Assert - Verificar resultado
  expect(result.id).toBeDefined();
  expect(result.text).toBe('Test');
});
```

## 🚨 Troubleshooting

### Problemas Comuns

1. **Timeout em testes**: Aumentar `jest.setTimeout()`
2. **Mocks não limpos**: Verificar `afterEach` cleanup
3. **Portas em uso**: Usar portas aleatórias para testes
4. **Socket.IO**: Garantir conexão/desconexão adequada

### Logs de Debug
```javascript
// Ativar logs específicos para debug
console.log('Test state:', testDatabase.getMessages());
```

## 📈 Métricas e Relatórios

### Automatização
- **CI/CD**: Executar testes em pipeline
- **Coverage Gates**: Falhar se cobertura < 90%
- **Test Reports**: Gerar relatórios automáticos

### Monitoramento
- **Test Duration**: Identificar testes lentos
- **Flaky Tests**: Testes que falham esporadicamente
- **Coverage Trends**: Acompanhar evolução da cobertura

---

**Lembre-se**: TDD não é apenas sobre escrever testes, é sobre design de código guiado por testes. Os testes devem documentar o comportamento esperado e guiar a implementação.