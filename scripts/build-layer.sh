#!/bin/bash

# Script para construir layer de dependencias para AWS Lambda
# Basado en el patrón del proyecto principal

echo "🔨 Construyendo layer de dependencias para Marcas Service..."

# Crear directorio de layer si no existe
mkdir -p layers/dependencies/nodejs

# Limpiar directorio anterior
rm -rf layers/dependencies/nodejs/*

# Instalar dependencias de producción en el directorio del layer
echo "📦 Instalando dependencias de producción..."
cd layers/dependencies/nodejs
npm init -y
npm install --production --no-optional

# Remover archivos innecesarios para reducir tamaño
echo "🧹 Limpiando archivos innecesarios..."
rm -rf node_modules/.cache
rm -rf node_modules/**/test
rm -rf node_modules/**/tests
rm -rf node_modules/**/docs
rm -rf node_modules/**/examples
rm -rf node_modules/**/example
rm -rf node_modules/**/*.md
rm -rf node_modules/**/LICENSE*
rm -rf node_modules/**/CHANGELOG*
rm -rf node_modules/**/HISTORY*
rm -rf node_modules/**/README*

# Crear archivo package.json para el layer
cat > package.json << EOF
{
  "name": "marcas-service-layer",
  "version": "1.0.0",
  "description": "Dependencies layer for Marcas Service Lambda",
  "main": "index.js",
  "dependencies": $(cat package.json | jq '.dependencies')
}
EOF

cd ../../..

echo "✅ Layer construido exitosamente en layers/dependencies/nodejs"
echo "📊 Tamaño del layer: $(du -sh layers/dependencies/nodejs | cut -f1)"
