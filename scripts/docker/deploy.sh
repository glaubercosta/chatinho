#!/bin/bash
# Script para deploy usando Docker Compose

set -e

ENVIRONMENT=${1:-"production"}
ACTION=${2:-"up"}

echo "🚀 Deploying Chatinho with Docker Compose..."
echo "📋 Configuration:"
echo "  - Environment: $ENVIRONMENT"
echo "  - Action: $ACTION"

# Verificar se o arquivo .env existe
if [[ ! -f ".env" ]]; then
  echo "⚠️  .env file not found. Creating from .env.docker..."
  cp .env.docker .env
fi

# Executar baseado na ação
case $ACTION in
  "up")
    echo "🔼 Starting services..."
    if [[ "$ENVIRONMENT" == "development" ]]; then
      docker-compose --profile dev up -d
    elif [[ "$ENVIRONMENT" == "production" ]]; then
      docker-compose --profile production up -d
    else
      docker-compose up -d
    fi
    ;;
  "down")
    echo "🔽 Stopping services..."
    docker-compose down
    ;;
  "restart")
    echo "🔄 Restarting services..."
    docker-compose restart
    ;;
  "logs")
    echo "📋 Showing logs..."
    docker-compose logs -f
    ;;
  "build")
    echo "🔨 Building and starting services..."
    docker-compose build --no-cache
    docker-compose up -d
    ;;
  *)
    echo "❌ Unknown action: $ACTION"
    echo "Available actions: up, down, restart, logs, build"
    exit 1
    ;;
esac

# Mostrar status dos containers
echo "📊 Container status:"
docker-compose ps

echo "✅ Deploy action '$ACTION' completed for environment '$ENVIRONMENT'!"

# Mostrar URLs de acesso
if [[ "$ACTION" == "up" || "$ACTION" == "build" ]]; then
  echo "🌐 Access URLs:"
  echo "  - Application: http://localhost:3002"
  echo "  - Health Check: http://localhost:3002/health"
fi