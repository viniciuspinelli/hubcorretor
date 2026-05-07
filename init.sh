#!/bin/sh
set -e

echo "🔄 Tentando aplicar migrações Prisma..."

# 1) Tenta deploy normal (banco vazio/novo)
if ./node_modules/.bin/prisma migrate deploy 2>&1; then
  echo "✅ Migrações aplicadas com sucesso"
else
  echo "⚠️  migrate deploy falhou; tentando baseline e reconciliação segura..."

  # 2) Marca baseline como aplicada (quando banco já existe sem _prisma_migrations)
  ./node_modules/.bin/prisma migrate resolve --applied 0_init 2>&1 || true

  # 3) Corrige divergências conhecidas sem resetar banco
  ./node_modules/.bin/prisma db execute --stdin <<'SQL' || true
-- Colunas obrigatórias
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "name" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);

-- Colunas opcionais do schema atual
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "agencyName" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "logoUrl" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "subscriptionId" TEXT;

-- Preenche valores padrão antes de aplicar NOT NULL
UPDATE "User" SET "name" = 'Usuario' WHERE "name" IS NULL;
UPDATE "User" SET "updatedAt" = CURRENT_TIMESTAMP WHERE "updatedAt" IS NULL;

-- Aplica NOT NULL nas colunas obrigatórias
ALTER TABLE "User" ALTER COLUMN "name" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "updatedAt" SET NOT NULL;
SQL

  # 4) Tenta novamente para aplicar qualquer pendência formal
  ./node_modules/.bin/prisma migrate deploy 2>&1 || true

  echo "ℹ️  Inicialização concluída com fallback de baseline/schema."
fi

echo "✅ Iniciando servidor Next.js..."
exec node server.js
