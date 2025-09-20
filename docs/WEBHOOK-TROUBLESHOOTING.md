# Chatinho - Guia de Teste de Webhook n8n

## ⚠️ Status da Conexão
**ERRO**: Não foi possível conectar ao webhook n8n em `http://192.168.252.50:5678/webhook/chat_glauber`

### Possíveis Causas:
1. **n8n não está rodando** na máquina `192.168.252.50`
2. **Porta 5678 bloqueada** por firewall
3. **Webhook não está ativo** no n8n
4. **URL incorreta** do webhook

## 🔧 Como Resolver

### 1. Verificar se o n8n está rodando
```powershell
# Teste de conectividade básica
Test-NetConnection -ComputerName "192.168.252.50" -Port 5678
```

### 2. Comandos PowerShell para Teste Manual

#### Testar n8n diretamente:
```powershell
$payload = @{
    text = "como troco a minha senha?"
    id = "12345"
    sender = "PowerShell Test"
    timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://192.168.252.50:5678/webhook/chat_glauber" -Method POST -ContentType "application/json" -Body $payload
```

#### Testar webhook local (receber do n8n):
```powershell
$localPayload = @{
    message = "Teste de mensagem do n8n"
    sender = "n8n Bot"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/webhook/n8n" -Method POST -ContentType "application/json" -Body $localPayload
```

### 3. Teste Via Interface Web
1. Abra: `http://localhost:3001`
2. Digite uma mensagem
3. **Marque** "Send to n8n"
4. Clique "Send"

### 4. Logs do Servidor
O servidor Chatinho mostra logs detalhados:
- ✅ Sucesso: "Message sent to n8n: {payload}"
- ❌ Erro: "Error sending to n8n: {erro}"

## 🛠️ Configuração Alternativa

Se a URL do webhook for diferente, edite o arquivo `.env`:
```bash
N8N_WEBHOOK_URL=http://SEU_IP:PORTA/webhook/WEBHOOK_ID
```

## 📋 Checklist de Troubleshooting

- [ ] n8n está rodando?
- [ ] Porta 5678 está aberta?
- [ ] Webhook está ativo no n8n?
- [ ] URL do webhook está correta?
- [ ] Firewall permitindo conexões?
- [ ] Payload está no formato correto?