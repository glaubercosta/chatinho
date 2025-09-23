# Multi-stage build para otimizar tamanho da imagem
# Estágio 1: Build dependencies
FROM node:18-alpine AS dependencies

# Configurar diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências com cache mount para otimização
RUN --mount=type=cache,target=/root/.npm \
    npm ci --only=production && npm cache clean --force

# Estágio 2: Build da aplicação
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar arquivos necessários para build
COPY package*.json ./
COPY . .

# Instalar todas as dependências (incluindo dev)
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# Executar testes (opcional - remova se não quiser rodar no build)
RUN npm test

# Estágio 3: Runtime - Imagem final otimizada
FROM node:18-alpine AS runtime

# Instalar dumb-init para gerenciamento de processos
RUN apk add --no-cache dumb-init

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S chatinho -u 1001

# Configurar diretório de trabalho
WORKDIR /app

# Copiar dependências de produção do estágio dependencies
COPY --from=dependencies --chown=chatinho:nodejs /app/node_modules ./node_modules

# Copiar código da aplicação
COPY --chown=chatinho:nodejs . .

# Criar diretório para logs
RUN mkdir -p /app/logs && chown chatinho:nodejs /app/logs

# Mudar para usuário não-root
USER chatinho

# Expor porta padrão
EXPOSE 3002

# Definir variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3002

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3002/health || exit 1

# Usar dumb-init como PID 1 para gerenciamento adequado de sinais
ENTRYPOINT ["dumb-init", "--"]

# Comando para iniciar a aplicação
CMD ["node", "server.js"]