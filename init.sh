#!/bin/sh
set -e

echo "🔄 Aplicando migrações Prisma..."

# 1) Tenta deploy normal (banco vazio ou com histórico limpo)
if ./node_modules/.bin/prisma migrate deploy 2>&1; then
  echo "✅ Migrações aplicadas com sucesso"
else
  echo "⚠️  migrate deploy falhou; tentando baseline do banco legado..."

  # 2) Banco já existe sem tabela _prisma_migrations: marca 0_init como aplicado
  ./node_modules/.bin/prisma migrate resolve --applied 0_init 2>&1 || true

  # 3) Aplica as demais migrations (1_add_user_columns etc.)
  ./node_modules/.bin/prisma migrate deploy 2>&1 || true

  echo "ℹ️  Inicialização concluída."
fi

echo "✅ Iniciando servidor Next.js..."
exec node server.js
