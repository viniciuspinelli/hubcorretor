#!/bin/sh
set -e

echo "🔄 Tentando aplicar migrações Prisma..."

# Tenta deploy primeiro (se banco estiver vazio ou novo)
if ./node_modules/.bin/prisma migrate deploy 2>&1; then
  echo "✅ Migrações aplicadas com sucesso"
else
  echo "⚠️  Deploy falhou, tentando resolver baseline..."
  # Se falhar com P3005 (banco não vazio), marca como já aplicada
  ./node_modules/.bin/prisma migrate resolve --rolled-back 0_init 2>&1 || true
  
  # Tenta db push como fallback
  ./node_modules/.bin/prisma db push --skip-generate --accept-data-loss 2>&1 || true
  
  echo "ℹ️  Continuando mesmo que migração tenha falhado..."
fi

echo "✅ Iniciando servidor Next.js..."
exec node server.js
