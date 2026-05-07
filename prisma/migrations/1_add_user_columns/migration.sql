-- AlterTable: adiciona colunas que existem no schema atual mas não no banco legado
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "name" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "agencyName" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "logoUrl" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "subscriptionId" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);

-- Preenche defaults antes de aplicar NOT NULL
UPDATE "User" SET "name" = 'Usuario' WHERE "name" IS NULL;
UPDATE "User" SET "updatedAt" = CURRENT_TIMESTAMP WHERE "updatedAt" IS NULL;

-- Aplica NOT NULL nas colunas obrigatórias
ALTER TABLE "User" ALTER COLUMN "name" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "updatedAt" SET NOT NULL;
