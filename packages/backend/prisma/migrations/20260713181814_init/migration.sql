-- CreateEnum
CREATE TYPE "Provincia" AS ENUM ('SanJose', 'Alajuela', 'Cartago', 'Heredia', 'Guanacaste', 'Puntarenas', 'Limon');

-- CreateEnum
CREATE TYPE "TipoPlastico" AS ENUM ('Desconocido', 'PET', 'PEAD', 'PVC', 'PEBD', 'PP', 'PS', 'Otros');

-- CreateEnum
CREATE TYPE "TipoTransaccion" AS ENUM ('UsuarioACentroGratis', 'UsuarioACentroUsuarioRecibe', 'UsuarioACentroUsuarioPaga', 'UsuarioAMunicipalidad', 'CentroACentro', 'ReconciliacionMunicipal');

-- CreateTable
CREATE TABLE "users" (
    "wallet" VARCHAR(42) NOT NULL,
    "identidadHash" VARCHAR(66) NOT NULL,
    "provincia" "Provincia" NOT NULL,
    "cantonId" INTEGER NOT NULL,
    "loteM2" INTEGER NOT NULL,
    "tipoVivienda" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "registradoEn" TIMESTAMP(3) NOT NULL,
    "blockNumber" BIGINT NOT NULL,
    "txHash" VARCHAR(66) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("wallet")
);

-- CreateTable
CREATE TABLE "collection_centers" (
    "wallet" VARCHAR(42) NOT NULL,
    "nombreHash" VARCHAR(66) NOT NULL,
    "cedulaHash" VARCHAR(66) NOT NULL,
    "provincia" "Provincia" NOT NULL,
    "cantonId" INTEGER NOT NULL,
    "loteM2" INTEGER NOT NULL,
    "tipoVivienda" INTEGER NOT NULL,
    "esPublico" BOOLEAN NOT NULL,
    "verificado" BOOLEAN NOT NULL DEFAULT false,
    "verificadoEn" TIMESTAMP(3),
    "verificadoPor" VARCHAR(42),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "registradoEn" TIMESTAMP(3) NOT NULL,
    "blockNumber" BIGINT NOT NULL,
    "txHash" VARCHAR(66) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "collection_centers_pkey" PRIMARY KEY ("wallet")
);

-- CreateTable
CREATE TABLE "municipalities" (
    "wallet" VARCHAR(42) NOT NULL,
    "nombreHash" VARCHAR(66) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "registradoEn" TIMESTAMP(3) NOT NULL,
    "blockNumber" BIGINT NOT NULL,
    "txHash" VARCHAR(66) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "municipalities_pkey" PRIMARY KEY ("wallet")
);

-- CreateTable
CREATE TABLE "transacciones" (
    "id" BIGINT NOT NULL,
    "origen" VARCHAR(42) NOT NULL,
    "destino" VARCHAR(42) NOT NULL,
    "pesoGramos" DECIMAL(78,0) NOT NULL,
    "tokensMinteados" DECIMAL(78,0) NOT NULL DEFAULT 0,
    "usdtPagado" DECIMAL(78,0) NOT NULL DEFAULT 0,
    "tipo" "TipoTransaccion" NOT NULL,
    "tipoPlastico" "TipoPlastico" NOT NULL,
    "reconciliada" BOOLEAN NOT NULL DEFAULT false,
    "loteId" BIGINT,
    "timestampOnchain" TIMESTAMP(3) NOT NULL,
    "blockNumber" BIGINT NOT NULL,
    "txHash" VARCHAR(66) NOT NULL,
    "logIndex" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transacciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "municipal_batches" (
    "id" BIGINT NOT NULL,
    "municipalidadWallet" VARCHAR(42) NOT NULL,
    "fechaRecoleccion" TIMESTAMP(3) NOT NULL,
    "rutaId" INTEGER NOT NULL,
    "cerrado" BOOLEAN NOT NULL DEFAULT false,
    "pesoOficialGramos" DECIMAL(78,0),
    "factorAjuste" DECIMAL(20,0),
    "blockNumberIniciado" BIGINT NOT NULL,
    "txHashIniciado" VARCHAR(66) NOT NULL,
    "blockNumberCerrado" BIGINT,
    "txHashCerrado" VARCHAR(66),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "municipal_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "token_mint_events" (
    "id" SERIAL NOT NULL,
    "destinatario" VARCHAR(42) NOT NULL,
    "cantidad" DECIMAL(78,0) NOT NULL,
    "transaccionId" BIGINT NOT NULL,
    "blockNumber" BIGINT NOT NULL,
    "txHash" VARCHAR(66) NOT NULL,
    "logIndex" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "token_mint_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "raw_events" (
    "id" SERIAL NOT NULL,
    "contractAddress" VARCHAR(42) NOT NULL,
    "eventName" TEXT NOT NULL,
    "blockNumber" BIGINT NOT NULL,
    "blockHash" VARCHAR(66) NOT NULL,
    "txHash" VARCHAR(66) NOT NULL,
    "logIndex" INTEGER NOT NULL,
    "args" JSONB NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "raw_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "indexer_state" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "chainId" INTEGER NOT NULL,
    "lastBlockNumber" BIGINT NOT NULL,
    "lastBlockHash" VARCHAR(66) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "indexer_state_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_identidadHash_key" ON "users"("identidadHash");

-- CreateIndex
CREATE INDEX "users_provincia_cantonId_idx" ON "users"("provincia", "cantonId");

-- CreateIndex
CREATE UNIQUE INDEX "collection_centers_cedulaHash_key" ON "collection_centers"("cedulaHash");

-- CreateIndex
CREATE INDEX "collection_centers_verificado_idx" ON "collection_centers"("verificado");

-- CreateIndex
CREATE INDEX "transacciones_origen_idx" ON "transacciones"("origen");

-- CreateIndex
CREATE INDEX "transacciones_destino_idx" ON "transacciones"("destino");

-- CreateIndex
CREATE INDEX "transacciones_tipo_idx" ON "transacciones"("tipo");

-- CreateIndex
CREATE INDEX "transacciones_loteId_idx" ON "transacciones"("loteId");

-- CreateIndex
CREATE INDEX "transacciones_blockNumber_idx" ON "transacciones"("blockNumber");

-- CreateIndex
CREATE UNIQUE INDEX "transacciones_txHash_logIndex_key" ON "transacciones"("txHash", "logIndex");

-- CreateIndex
CREATE INDEX "municipal_batches_municipalidadWallet_cerrado_idx" ON "municipal_batches"("municipalidadWallet", "cerrado");

-- CreateIndex
CREATE INDEX "token_mint_events_destinatario_idx" ON "token_mint_events"("destinatario");

-- CreateIndex
CREATE UNIQUE INDEX "token_mint_events_txHash_logIndex_key" ON "token_mint_events"("txHash", "logIndex");

-- CreateIndex
CREATE INDEX "raw_events_processed_idx" ON "raw_events"("processed");

-- CreateIndex
CREATE UNIQUE INDEX "raw_events_txHash_logIndex_key" ON "raw_events"("txHash", "logIndex");

-- CreateIndex
CREATE UNIQUE INDEX "indexer_state_chainId_key" ON "indexer_state"("chainId");

-- AddForeignKey
ALTER TABLE "transacciones" ADD CONSTRAINT "transacciones_origen_fkey" FOREIGN KEY ("origen") REFERENCES "users"("wallet") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transacciones" ADD CONSTRAINT "transacciones_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "municipal_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "municipal_batches" ADD CONSTRAINT "municipal_batches_municipalidadWallet_fkey" FOREIGN KEY ("municipalidadWallet") REFERENCES "municipalities"("wallet") ON DELETE RESTRICT ON UPDATE CASCADE;
