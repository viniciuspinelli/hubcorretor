#!/bin/sh
set -e

echo "🔄 Aplicando migrações Prisma..."

# 1) Tenta deploy normal (banco vazio ou com histórico limpo)
if ./node_modules/.bin/prisma migrate deploy 2>&1; then
  echo "✅ Migrações aplicadas com sucesso"
else
  echo "⚠️  migrate deploy falhou; tentando baseline do banco legado..."

  # 2) Banco legado sem _prisma_migrations: marca 0_init e 1_add_user_columns como aplicados
  #    (o 2_reset_schema vai recriar tudo do zero com o schema correto)
  ./node_modules/.bin/prisma migrate resolve --applied 0_init 2>&1 || true
  ./node_modules/.bin/prisma migrate resolve --applied 1_add_user_columns 2>&1 || true

  # 3) Aplica apenas o 2_reset_schema (DROP + CREATE com schema correto)
  ./node_modules/.bin/prisma migrate deploy 2>&1 || true

  echo "ℹ️  Inicialização concluída."
fi

echo "✅ Iniciando servidor Next.js..."
exec node server.js
