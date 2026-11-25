-- CreateEnum
CREATE TYPE "EstadoDeclaracion" AS ENUM ('PENDIENTE', 'CONFIRMADA');

-- CreateTable
CREATE TABLE "declaraciones" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(16) NOT NULL,
    "accountId" INTEGER NOT NULL,
    "wallet" VARCHAR(42) NOT NULL,
    "material" "Material" NOT NULL,
    "cantidadKg" DECIMAL(78,0) NOT NULL,
    "periodo" INTEGER NOT NULL,
    "periodoTexto" VARCHAR(40) NOT NULL,
    "entidadDestino" VARCHAR(200) NOT NULL,
    "referencia" VARCHAR(120),
    "descripcion" VARCHAR(1000),
    "razonSocial" VARCHAR(200),
    "cedulaJuridica" VARCHAR(40),
    "contenido" TEXT NOT NULL,
    "informeRef" VARCHAR(66) NOT NULL,
    "estado" "EstadoDeclaracion" NOT NULL DEFAULT 'PENDIENTE',
    "txHash" VARCHAR(66),
    "blockNumber" BIGINT,
    "confirmadaEn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "declaraciones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "declaraciones_codigo_key" ON "declaraciones"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "declaraciones_informeRef_key" ON "declaraciones"("informeRef");

-- CreateIndex
CREATE UNIQUE INDEX "declaraciones_txHash_key" ON "declaraciones"("txHash");

-- CreateIndex
CREATE INDEX "declaraciones_accountId_idx" ON "declaraciones"("accountId");

-- CreateIndex
CREATE INDEX "declaraciones_wallet_material_estado_idx" ON "declaraciones"("wallet", "material", "estado");

-- AddForeignKey
ALTER TABLE "declaraciones" ADD CONSTRAINT "declaraciones_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

