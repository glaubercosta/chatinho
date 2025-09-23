#!/bin/bash
# Script para build da imagem Docker

set -e

echo "🐳 Building Chatinho Docker Image..."

# Definir variáveis
IMAGE_NAME="chatinho"
VERSION=${1:-"latest"}
BUILD_TARGET=${2:-"runtime"}

echo "📋 Build Configuration:"
echo "  - Image Name: $IMAGE_NAME"
echo "  - Version: $VERSION"
echo "  - Target: $BUILD_TARGET"

# Build da imagem
echo "🔨 Building Docker image..."
docker build \
  --target $BUILD_TARGET \
  --tag $IMAGE_NAME:$VERSION \
  --tag $IMAGE_NAME:latest \
  --build-arg NODE_ENV=production \
  --progress=plain \
  .

echo "✅ Build completed successfully!"
echo "📦 Image: $IMAGE_NAME:$VERSION"

# Mostrar informações da imagem
echo "📊 Image information:"
docker images $IMAGE_NAME:$VERSION

# Opcional: rodar testes na imagem
if [[ "$3" == "test" ]]; then
  echo "🧪 Running tests in container..."
  docker run --rm $IMAGE_NAME:$VERSION npm test
fi

echo "🎉 Docker build process completed!"