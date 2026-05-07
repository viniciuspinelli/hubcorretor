# ============================================================
# Stage 1: deps — instala APENAS as dependências de produção
# ============================================================
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# ============================================================
# Stage 2: builder — compila o Next.js
# ============================================================
FROM node:20-alpine AS builder
RUN apk add --no-cache openssl
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Gera o Prisma Client com base no schema atual
RUN npx prisma generate

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ============================================================
# Stage 3: runner — imagem final, mínima para produção
# ============================================================
FROM node:20-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copia o output standalone do Next.js
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copia o schema do Prisma e node_modules para rodar migrate no start
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Executa as migrations pendentes e inicia o servidor
CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy && node server.js"]
