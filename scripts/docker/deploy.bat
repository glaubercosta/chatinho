@echo off
REM Script para deploy usando Docker Compose no Windows

set ENVIRONMENT=%1
if "%ENVIRONMENT%"=="" set ENVIRONMENT=production
set ACTION=%2
if "%ACTION%"=="" set ACTION=up

echo 🚀 Deploying Chatinho with Docker Compose...
echo 📋 Configuration:
echo   - Environment: %ENVIRONMENT%
echo   - Action: %ACTION%

REM Verificar se o arquivo .env existe
if not exist ".env" (
  echo ⚠️  .env file not found. Creating from .env.docker...
  copy .env.docker .env
)

REM Executar baseado na ação
if "%ACTION%"=="up" (
  echo 🔼 Starting services...
  if "%ENVIRONMENT%"=="development" (
    docker-compose --profile dev up -d
  ) else if "%ENVIRONMENT%"=="production" (
    docker-compose --profile production up -d
  ) else (
    docker-compose up -d
  )
) else if "%ACTION%"=="down" (
  echo 🔽 Stopping services...
  docker-compose down
) else if "%ACTION%"=="restart" (
  echo 🔄 Restarting services...
  docker-compose restart
) else if "%ACTION%"=="logs" (
  echo 📋 Showing logs...
  docker-compose logs -f
) else if "%ACTION%"=="build" (
  echo 🔨 Building and starting services...
  docker-compose build --no-cache
  docker-compose up -d
) else (
  echo ❌ Unknown action: %ACTION%
  echo Available actions: up, down, restart, logs, build
  exit /b 1
)

if %ERRORLEVEL% neq 0 (
    echo ❌ Deploy failed!
    exit /b 1
)

REM Mostrar status dos containers
echo 📊 Container status:
docker-compose ps

echo ✅ Deploy action '%ACTION%' completed for environment '%ENVIRONMENT%'!

REM Mostrar URLs de acesso
if "%ACTION%"=="up" (
  echo 🌐 Access URLs:
  echo   - Application: http://localhost:3002
  echo   - Health Check: http://localhost:3002/health
) else if "%ACTION%"=="build" (
  echo 🌐 Access URLs:
  echo   - Application: http://localhost:3002
  echo   - Health Check: http://localhost:3002/health
)