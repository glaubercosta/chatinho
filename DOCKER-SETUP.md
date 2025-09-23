# 🐳 Chatinho Docker Setup - Guia Rápido

## ✅ Setup Completo Realizado

Seu projeto Chatinho agora está completamente configurado para Docker com:

### 📁 Arquivos Criados:
- `Dockerfile` - Imagem Docker otimizada multi-stage
- `Dockerfile.dev` - Imagem para desenvolvimento
- `docker-compose.yml` - Orquestração completa
- `.dockerignore` - Otimização de build
- `.env.docker` - Configurações Docker
- `scripts/docker/` - Scripts automatizados
- `docs/DOCKER.md` - Documentação completa

## 🚀 Como Usar

### 1. Configuração Inicial
```bash
# Copiar configurações
cp .env.docker .env

# Editar variáveis importantes (especialmente):
# - N8N_WEBHOOK_URL
# - ADMIN_KEY
```

### 2. Build da Imagem
```bash
# Windows
scripts\docker\build.bat

# Linux/Mac
chmod +x scripts/docker/*.sh
./scripts/docker/build.sh
```

### 3. Executar com Docker Compose
```bash
# Windows
scripts\docker\deploy.bat production up

# Linux/Mac
./scripts/docker/deploy.sh production up
```

### 4. Verificar
```bash
# Status dos containers
docker-compose ps

# Logs
docker-compose logs -f

# Testar aplicação
curl http://localhost:3002/health
```

## 🎯 Comandos Principais

### Desenvolvimento
```bash
# Modo desenvolvimento
docker-compose --profile dev up -d

# Com rebuild
docker-compose build --no-cache
docker-compose up -d
```

### Produção
```bash
# Deploy produção
docker-compose up -d

# Com Nginx
docker-compose --profile production --profile nginx up -d
```

### Manutenção
```bash
# Parar tudo
docker-compose down

# Limpar volumes
docker-compose down -v

# Restart específico
docker-compose restart chatinho
```

## 🔧 Personalização

### Variáveis Importantes (.env)
```env
NODE_ENV=production
PORT=3002
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/endpoint
ADMIN_KEY=your-secure-admin-key-here
CORS_ORIGIN=*
MESSAGE_RETENTION_HOURS=24
```

### Resources e Limites
No `docker-compose.yml`, ajuste conforme necessário:
```yaml
deploy:
  resources:
    limits:
      memory: 512M
      cpus: '0.5'
```

## 📊 Monitoramento

### Health Checks
```bash
curl http://localhost:3002/health
curl http://localhost:3002/api/health
```

### Logs
```bash
# Logs da aplicação
docker-compose logs chatinho

# Logs em tempo real
docker-compose logs -f

# Logs do sistema
docker system df
docker stats
```

## 🔒 Segurança

### Configurações Aplicadas
- ✅ Usuário não-root (chatinho:1001)  
- ✅ Multi-stage build otimizado
- ✅ Resource limits configurados
- ✅ Health checks ativos
- ✅ Environment variables para secrets

### Para Produção
1. Gere um ADMIN_KEY seguro:
   ```bash
   openssl rand -hex 32
   ```

2. Use HTTPS e configure CORS adequadamente

3. Configure backup dos logs:
   ```bash
   # Volume para logs
   ./logs:/app/logs:rw
   ```

## 🌐 Deploy em Produção

### Docker Swarm
```bash
docker swarm init
docker stack deploy -c docker-compose.yml chatinho
```

### Kubernetes
Consulte `docs/DOCKER.md` para exemplo de deployment.yaml

## 📚 Documentação Completa

Para informações detalhadas, consulte:
- `docs/DOCKER.md` - Guia completo do Docker
- `README.md` - Documentação geral do projeto

## 🆘 Troubleshooting

### Container não inicia
```bash
docker-compose logs chatinho
docker-compose config
```

### Problemas de conectividade
```bash
docker network ls
docker network inspect chatinho-network
```

### Performance
```bash
docker stats
docker system df
```

---

**🎉 Seu Chatinho está pronto para Docker!**

Acesse: http://localhost:3002