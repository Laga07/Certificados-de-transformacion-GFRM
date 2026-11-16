-- CreateEnum
CREATE TYPE "AccountRol" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "TipoAuthToken" AS ENUM ('VERIFICAR_EMAIL', 'RESET_PASSWORD');

-- CreateEnum
CREATE TYPE "TipoEntidad" AS ENUM ('SEPARADOR', 'INTERMEDIARIO', 'TRANSFORMADOR', 'COMPRADOR');

-- CreateEnum
CREATE TYPE "EstadoRevision" AS ENUM ('PENDIENTE', 'APROBADO', 'RECHAZADO');

-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "bloqueadoHasta" TIMESTAMP(3),
ADD COLUMN     "emailVerificadoEn" TIMESTAMP(3),
ADD COLUMN     "intentosFallidos" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "rol" "AccountRol" NOT NULL DEFAULT 'USER',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "walletAddress" VARCHAR(42),
ADD COLUMN     "walletNonce" VARCHAR(64),
ADD COLUMN     "walletVinculadaEn" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "auth_tokens" (
    "id" SERIAL NOT NULL,
    "accountId" INTEGER NOT NULL,
    "tipo" "TipoAuthToken" NOT NULL,
    "tokenHash" VARCHAR(64) NOT NULL,
    "expiraEn" TIMESTAMP(3) NOT NULL,
    "usadoEn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entidad_perfiles" (
    "id" SERIAL NOT NULL,
    "accountId" INTEGER NOT NULL,
    "tipo" "TipoEntidad" NOT NULL,
    "razonSocial" VARCHAR(200) NOT NULL,
    "cedula" VARCHAR(40) NOT NULL,
    "cedulaHash" VARCHAR(66) NOT NULL,
    "representante" VARCHAR(200),
    "telefono" VARCHAR(40),
    "correoContacto" VARCHAR(255),
    "direccion" VARCHAR(500),
    "provincia" "Provincia" NOT NULL,
    "cantonId" INTEGER NOT NULL,
    "subtipo" INTEGER,
    "descripcion" VARCHAR(2000),
    "estadoRevision" "EstadoRevision" NOT NULL DEFAULT 'PENDIENTE',
    "notasRevisor" VARCHAR(2000),
    "revisadoPorId" INTEGER,
    "revisadoEn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "entidad_perfiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "perfil_documentos" (
    "id" SERIAL NOT NULL,
    "perfilId" INTEGER NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "mimeType" VARCHAR(100) NOT NULL,
    "tamano" INTEGER NOT NULL,
    "storageKey" VARCHAR(500) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "perfil_documentos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "auth_tokens_tokenHash_key" ON "auth_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "auth_tokens_accountId_tipo_idx" ON "auth_tokens"("accountId", "tipo");

-- CreateIndex
CREATE UNIQUE INDEX "entidad_perfiles_accountId_key" ON "entidad_perfiles"("accountId");

-- CreateIndex
CREATE INDEX "entidad_perfiles_estadoRevision_tipo_idx" ON "entidad_perfiles"("estadoRevision", "tipo");

-- CreateIndex
CREATE INDEX "entidad_perfiles_cedulaHash_idx" ON "entidad_perfiles"("cedulaHash");

-- CreateIndex
CREATE UNIQUE INDEX "perfil_documentos_storageKey_key" ON "perfil_documentos"("storageKey");

-- CreateIndex
CREATE INDEX "perfil_documentos_perfilId_idx" ON "perfil_documentos"("perfilId");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_walletAddress_key" ON "accounts"("walletAddress");

-- AddForeignKey
ALTER TABLE "auth_tokens" ADD CONSTRAINT "auth_tokens_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entidad_perfiles" ADD CONSTRAINT "entidad_perfiles_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perfil_documentos" ADD CONSTRAINT "perfil_documentos_perfilId_fkey" FOREIGN KEY ("perfilId") REFERENCES "entidad_perfiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

