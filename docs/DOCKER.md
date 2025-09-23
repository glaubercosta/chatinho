# 🐳 Docker Deployment Guide

Este documento descreve como executar o Chatinho usando Docker para desenvolvimento e produção.

## 📋 Pré-requisitos

- Docker Engine 20.10+
- Docker Compose 2.0+
- 2GB de RAM disponível
- 1GB de espaço em disco

## 🚀 Quick Start

### 1. Configuração Rápida
```bash
# Clonar e configurar
git clone <repository-url>
cd chatinho

# Copiar configurações Docker
cp .env.docker .env

# Ajustar variáveis de ambiente no .env
# Especialmente N8N_WEBHOOK_URL e ADMIN_KEY
```

### 2. Build e Deploy
```bash
# Windows
scripts\docker\build.bat
scripts\docker\deploy.bat production up

# Linux/Mac
chmod +x scripts/docker/*.sh
./scripts/docker/build.sh
./scripts/docker/deploy.sh production up
```

### 3. Verificar Deployment
```bash
# Verificar containers
docker-compose ps

# Verificar logs
docker-compose logs -f chatinho

# Testar aplicação
curl http://localhost:3002/health
```

## 🔧 Configuração Detalhada

### Variáveis de Ambiente (.env)
```env
# Essenciais
NODE_ENV=production
PORT=3002
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/endpoint
ADMIN_KEY=your-secure-admin-key

# Opcionais
CORS_ORIGIN=*
MESSAGE_RETENTION_HOURS=24
MAX_MESSAGE_LENGTH=1000
LOG_LEVEL=info
```

### Profiles Docker Compose

#### Produção (Padrão)
```bash
docker-compose up -d
```

#### Desenvolvimento
```bash
docker-compose --profile dev up -d
```

#### Com Nginx (Proxy)
```bash
docker-compose --profile production --profile nginx up -d
```

## 📊 Comandos Úteis

### Build
```bash
# Build simples
docker build -t chatinho:latest .

# Build com scripts (recomendado)
./scripts/docker/build.sh [version] [target] [test]

# Exemplos:
./scripts/docker/build.sh v1.0.0
./scripts/docker/build.sh latest runtime test
```

### Deploy
```bash
# Deploy produção
./scripts/docker/deploy.sh production up

# Deploy desenvolvimento
./scripts/docker/deploy.sh development up

# Outros comandos
./scripts/docker/deploy.sh production down     # Parar
./scripts/docker/deploy.sh production restart  # Reiniciar
./scripts/docker/deploy.sh production logs     # Logs
./scripts/docker/deploy.sh production build    # Rebuild
```

### Monitoramento
```bash
# Status dos containers
docker-compose ps

# Logs em tempo real
docker-compose logs -f

# Logs específicos
docker-compose logs chatinho

# Estatísticas de uso
docker stats

# Health check
curl http://localhost:3002/health
```

### Manutenção
```bash
# Restart apenas o app
docker-compose restart chatinho

# Rebuild sem cache
docker-compose build --no-cache

# Limpar volumes
docker-compose down -v

# Limpar tudo
docker system prune -a
```

## 🏗️ Arquitetura Docker

### Multi-stage Build
1. **dependencies**: Instala dependências de produção
2. **builder**: Executa testes e build
3. **runtime**: Imagem final otimizada

### Recursos e Limites
- **CPU**: 0.5 cores (limite), 0.25 cores (reserva)
- **RAM**: 512MB (limite), 256MB (reserva)
- **Storage**: Logs persistidos em volume

### Rede
- **Network**: `chatinho-network` (bridge)
- **Portas**: 3002 (app), 80/443 (nginx)

## 🔒 Segurança

### Configurações Aplicadas
- ✅ Usuário não-root (chatinho:1001)
- ✅ Filesystem read-only onde possível
- ✅ Health checks configurados
- ✅ Resource limits aplicados
- ✅ Secrets via environment variables
- ✅ Network isolation

### Recomendações Adicionais
```bash
# Gerar ADMIN_KEY segura
openssl rand -hex 32

# Usar Docker secrets (produção)
echo "your-secret" | docker secret create admin_key -

# Scan de vulnerabilidades
docker scan chatinho:latest
```

## 🚨 Troubleshooting

### Container não inicia
```bash
# Verificar logs
docker-compose logs chatinho

# Verificar configuração
docker-compose config

# Verificar recursos
docker system df
```

### Problemas de Conectividade
```bash
# Verificar rede
docker network ls
docker network inspect chatinho-network

# Testar conectividade interna
docker-compose exec chatinho wget -O- http://localhost:3002/health
```

### Performance Issues
```bash
# Verificar recursos
docker stats chatinho-app

# Verificar logs de performance
docker-compose logs chatinho | grep "Memory usage"

# Ajustar limites no docker-compose.yml
```

### Problemas de Build
```bash
# Limpar cache
docker builder prune

# Build verbose
docker build --progress=plain --no-cache .

# Verificar .dockerignore
```

## 🌐 Deployment em Produção

### Usando Docker Swarm
```bash
# Inicializar swarm
docker swarm init

# Deploy
docker stack deploy -c docker-compose.yml chatinho

# Verificar
docker stack services chatinho
```

### Usando Kubernetes
```yaml
# Exemplo de deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: chatinho
spec:
  replicas: 2
  selector:
    matchLabels:
      app: chatinho
  template:
    metadata:
      labels:
        app: chatinho
    spec:
      containers:
      - name: chatinho
        image: chatinho:latest
        ports:
        - containerPort: 3002
        env:
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "3002"
```

### CI/CD Pipeline Exemplo
```yaml
# .github/workflows/docker.yml
name: Docker Build and Deploy
on:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Build Docker image
      run: |
        docker build -t chatinho:${{ github.sha }} .
        docker tag chatinho:${{ github.sha }} chatinho:latest
    - name: Deploy
      run: |
        docker-compose up -d
```

## 📚 Referências

- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Node.js Docker Guide](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [Container Security](https://docs.docker.com/engine/security/)

## 🆘 Suporte

Para problemas específicos do Docker:

1. Verificar logs: `docker-compose logs`
2. Verificar configuração: `docker-compose config`
3. Verificar recursos: `docker system df`
4. Consultar documentação oficial do Docker

---

**Nota**: Sempre teste em ambiente de desenvolvimento antes de fazer deploy em produção!