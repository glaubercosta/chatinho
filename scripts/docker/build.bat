@echo off
REM Script para build da imagem Docker no Windows

echo 🐳 Building Chatinho Docker Image...

REM Definir variáveis
set IMAGE_NAME=chatinho
set VERSION=%1
if "%VERSION%"=="" set VERSION=latest
set BUILD_TARGET=%2
if "%BUILD_TARGET%"=="" set BUILD_TARGET=runtime

echo 📋 Build Configuration:
echo   - Image Name: %IMAGE_NAME%
echo   - Version: %VERSION%
echo   - Target: %BUILD_TARGET%

REM Build da imagem
echo 🔨 Building Docker image...
docker build ^
  --target %BUILD_TARGET% ^
  --tag %IMAGE_NAME%:%VERSION% ^
  --tag %IMAGE_NAME%:latest ^
  --build-arg NODE_ENV=production ^
  --progress=plain ^
  .

if %ERRORLEVEL% neq 0 (
    echo ❌ Build failed!
    exit /b 1
)

echo ✅ Build completed successfully!
echo 📦 Image: %IMAGE_NAME%:%VERSION%

REM Mostrar informações da imagem
echo 📊 Image information:
docker images %IMAGE_NAME%:%VERSION%

REM Opcional: rodar testes na imagem
if "%3"=="test" (
  echo 🧪 Running tests in container...
  docker run --rm %IMAGE_NAME%:%VERSION% npm test
)

echo 🎉 Docker build process completed!