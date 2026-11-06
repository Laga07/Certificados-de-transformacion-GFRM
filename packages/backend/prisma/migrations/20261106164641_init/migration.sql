-- CreateEnum
CREATE TYPE "Provincia" AS ENUM ('SanJose', 'Alajuela', 'Cartago', 'Heredia', 'Guanacaste', 'Puntarenas', 'Limon');

-- CreateEnum
CREATE TYPE "Material" AS ENUM ('Plastico', 'CartonPapel', 'Tetrapack', 'Vidrio', 'Metales');

-- CreateEnum
CREATE TYPE "ModalidadEntrega" AS ENUM ('SinPago', 'ConPago', 'RutaMunicipal');

-- CreateEnum
CREATE TYPE "QuienAbsorbe" AS ENUM ('Envia', 'Recibe', 'Mitad');

-- CreateEnum
CREATE TYPE "EstadoTraspaso" AS ENUM ('Declarado', 'Confirmado');

-- CreateTable
CREATE TABLE "separadores" (
    "wallet" VARCHAR(42) NOT NULL,
    "identidadHash" VARCHAR(66) NOT NULL,
    "provincia" "Provincia" NOT NULL,
    "cantonId" INTEGER NOT NULL,
    "tipoSeparador" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "registradoEn" TIMESTAMP(3) NOT NULL,
    "blockNumber" BIGINT NOT NULL,
    "txHash" VARCHAR(66) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "separadores_pkey" PRIMARY KEY ("wallet")
);

-- CreateTable
CREATE TABLE "intermediarios" (
    "wallet" VARCHAR(42) NOT NULL,
    "nombreHash" VARCHAR(66) NOT NULL,
    "cedulaHash" VARCHAR(66) NOT NULL,
    "provincia" "Provincia" NOT NULL,
    "cantonId" INTEGER NOT NULL,
    "subtipo" INTEGER NOT NULL,
    "verificado" BOOLEAN NOT NULL DEFAULT false,
    "verificadoEn" TIMESTAMP(3),
    "verificadoPor" VARCHAR(42),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "registradoEn" TIMESTAMP(3) NOT NULL,
    "blockNumber" BIGINT NOT NULL,
    "txHash" VARCHAR(66) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "intermediarios_pkey" PRIMARY KEY ("wallet")
);

-- CreateTable
CREATE TABLE "transformadores" (
    "wallet" VARCHAR(42) NOT NULL,
    "nombreHash" VARCHAR(66) NOT NULL,
    "cedulaHash" VARCHAR(66) NOT NULL,
    "provincia" "Provincia" NOT NULL,
    "cantonId" INTEGER NOT NULL,
    "verificado" BOOLEAN NOT NULL DEFAULT false,
    "verificadoEn" TIMESTAMP(3),
    "verificadoPor" VARCHAR(42),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "registradoEn" TIMESTAMP(3) NOT NULL,
    "blockNumber" BIGINT NOT NULL,
    "txHash" VARCHAR(66) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transformadores_pkey" PRIMARY KEY ("wallet")
);

-- CreateTable
CREATE TABLE "compradores" (
    "wallet" VARCHAR(42) NOT NULL,
    "nombreHash" VARCHAR(66) NOT NULL,
    "cedulaHash" VARCHAR(66) NOT NULL,
    "empresaObligadaLey9786" BOOLEAN NOT NULL DEFAULT false,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "registradoEn" TIMESTAMP(3) NOT NULL,
    "blockNumber" BIGINT NOT NULL,
    "txHash" VARCHAR(66) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "compradores_pkey" PRIMARY KEY ("wallet")
);

-- CreateTable
CREATE TABLE "lotes" (
    "id" BIGINT NOT NULL,
    "material" "Material" NOT NULL,
    "varianteId" INTEGER NOT NULL,
    "custodioActual" VARCHAR(42) NOT NULL,
    "pesoActual" DECIMAL(78,0) NOT NULL,
    "pesoAceptadoOrigen" DECIMAL(78,0) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "blockNumberCreado" BIGINT NOT NULL,
    "txHashCreado" VARCHAR(66) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entregas" (
    "id" SERIAL NOT NULL,
    "loteId" BIGINT NOT NULL,
    "separadorWallet" VARCHAR(42) NOT NULL,
    "receptorWallet" VARCHAR(42) NOT NULL,
    "material" "Material" NOT NULL,
    "varianteId" INTEGER NOT NULL,
    "pesoGramos" DECIMAL(78,0) NOT NULL,
    "modalidad" "ModalidadEntrega" NOT NULL,
    "precioUSDTporKg" DECIMAL(78,0) NOT NULL,
    "blockNumber" BIGINT NOT NULL,
    "txHash" VARCHAR(66) NOT NULL,
    "logIndex" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "entregas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lote_union_eventos" (
    "id" SERIAL NOT NULL,
    "nuevoLoteId" BIGINT NOT NULL,
    "loteIdsOrigen" JSONB NOT NULL,
    "pesosOrigen" JSONB NOT NULL,
    "varianteResultante" INTEGER NOT NULL,
    "blockNumber" BIGINT NOT NULL,
    "txHash" VARCHAR(66) NOT NULL,
    "logIndex" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lote_union_eventos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lote_division_eventos" (
    "id" SERIAL NOT NULL,
    "loteIdOrigen" BIGINT NOT NULL,
    "nuevosLoteIds" JSONB NOT NULL,
    "pesos" JSONB NOT NULL,
    "blockNumber" BIGINT NOT NULL,
    "txHash" VARCHAR(66) NOT NULL,
    "logIndex" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lote_division_eventos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "traspasos" (
    "id" SERIAL NOT NULL,
    "loteId" BIGINT NOT NULL,
    "de" VARCHAR(42) NOT NULL,
    "hacia" VARCHAR(42) NOT NULL,
    "pesoEnviado" DECIMAL(78,0) NOT NULL,
    "precioUSDTporKg" DECIMAL(78,0) NOT NULL,
    "estado" "EstadoTraspaso" NOT NULL DEFAULT 'Declarado',
    "pesoRecibido" DECIMAL(78,0),
    "merma" DECIMAL(78,0),
    "quienAbsorbe" "QuienAbsorbe",
    "blockNumberDeclarado" BIGINT NOT NULL,
    "txHashDeclarado" VARCHAR(66) NOT NULL,
    "blockNumberConfirmado" BIGINT,
    "txHashConfirmado" VARCHAR(66),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "traspasos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificado_contratos" (
    "material" "Material" NOT NULL,
    "direccion" VARCHAR(42) NOT NULL,
    "nombre" TEXT NOT NULL,
    "simbolo" TEXT NOT NULL,
    "blockNumber" BIGINT NOT NULL,
    "txHash" VARCHAR(66) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "certificado_contratos_pkey" PRIMARY KEY ("material")
);

-- CreateTable
CREATE TABLE "emisiones" (
    "id" BIGINT NOT NULL,
    "material" "Material" NOT NULL,
    "transformadorWallet" VARCHAR(42) NOT NULL,
    "loteConsolidadoId" BIGINT NOT NULL,
    "pesoConsumidoTotal" DECIMAL(78,0) NOT NULL,
    "kgTransformadosOriginal" DECIMAL(78,0) NOT NULL,
    "kgDisponiblesPrimario" DECIMAL(78,0) NOT NULL,
    "pesoAceptadoOrigenTotal" DECIMAL(78,0) NOT NULL,
    "mermaTransformador" DECIMAL(78,0) NOT NULL,
    "precioUSDTporKg" DECIMAL(78,0) NOT NULL,
    "blockNumber" BIGINT NOT NULL,
    "txHash" VARCHAR(66) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "emisiones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emision_aportes" (
    "id" SERIAL NOT NULL,
    "emisionId" BIGINT NOT NULL,
    "separadorWallet" VARCHAR(42) NOT NULL,
    "kgAportado" DECIMAL(78,0) NOT NULL,

    CONSTRAINT "emision_aportes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emision_eslabones" (
    "id" SERIAL NOT NULL,
    "emisionId" BIGINT NOT NULL,
    "direccion" VARCHAR(42) NOT NULL,
    "mermaKg" DECIMAL(78,0) NOT NULL,

    CONSTRAINT "emision_eslabones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ventas_primarias" (
    "id" SERIAL NOT NULL,
    "emisionId" BIGINT NOT NULL,
    "compradorWallet" VARCHAR(42) NOT NULL,
    "cantidadKg" DECIMAL(78,0) NOT NULL,
    "valorTotal" DECIMAL(78,0) NOT NULL,
    "blockNumber" BIGINT NOT NULL,
    "txHash" VARCHAR(66) NOT NULL,
    "logIndex" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ventas_primarias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagos_acreditados" (
    "id" SERIAL NOT NULL,
    "ventaId" INTEGER,
    "emisionId" BIGINT NOT NULL,
    "destinatario" VARCHAR(42) NOT NULL,
    "monto" DECIMAL(78,0) NOT NULL,
    "blockNumber" BIGINT NOT NULL,
    "txHash" VARCHAR(66) NOT NULL,
    "logIndex" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pagos_acreditados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagos_retiros" (
    "id" SERIAL NOT NULL,
    "destinatario" VARCHAR(42) NOT NULL,
    "monto" DECIMAL(78,0) NOT NULL,
    "blockNumber" BIGINT NOT NULL,
    "txHash" VARCHAR(66) NOT NULL,
    "logIndex" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pagos_retiros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificado_retiros" (
    "id" SERIAL NOT NULL,
    "compradorWallet" VARCHAR(42) NOT NULL,
    "material" "Material" NOT NULL,
    "cantidadKg" DECIMAL(78,0) NOT NULL,
    "informeRef" VARCHAR(66) NOT NULL,
    "periodo" INTEGER NOT NULL,
    "blockNumber" BIGINT NOT NULL,
    "txHash" VARCHAR(66) NOT NULL,
    "logIndex" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "certificado_retiros_pkey" PRIMARY KEY ("id")
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

-- CreateTable
CREATE TABLE "accounts" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "separadores_identidadHash_key" ON "separadores"("identidadHash");

-- CreateIndex
CREATE INDEX "separadores_provincia_cantonId_idx" ON "separadores"("provincia", "cantonId");

-- CreateIndex
CREATE UNIQUE INDEX "intermediarios_cedulaHash_key" ON "intermediarios"("cedulaHash");

-- CreateIndex
CREATE INDEX "intermediarios_verificado_idx" ON "intermediarios"("verificado");

-- CreateIndex
CREATE INDEX "intermediarios_provincia_cantonId_idx" ON "intermediarios"("provincia", "cantonId");

-- CreateIndex
CREATE UNIQUE INDEX "transformadores_cedulaHash_key" ON "transformadores"("cedulaHash");

-- CreateIndex
CREATE INDEX "transformadores_verificado_idx" ON "transformadores"("verificado");

-- CreateIndex
CREATE UNIQUE INDEX "compradores_cedulaHash_key" ON "compradores"("cedulaHash");

-- CreateIndex
CREATE INDEX "lotes_material_activo_idx" ON "lotes"("material", "activo");

-- CreateIndex
CREATE INDEX "lotes_custodioActual_idx" ON "lotes"("custodioActual");

-- CreateIndex
CREATE INDEX "entregas_loteId_idx" ON "entregas"("loteId");

-- CreateIndex
CREATE INDEX "entregas_separadorWallet_idx" ON "entregas"("separadorWallet");

-- CreateIndex
CREATE INDEX "entregas_receptorWallet_idx" ON "entregas"("receptorWallet");

-- CreateIndex
CREATE UNIQUE INDEX "entregas_txHash_logIndex_key" ON "entregas"("txHash", "logIndex");

-- CreateIndex
CREATE INDEX "lote_union_eventos_nuevoLoteId_idx" ON "lote_union_eventos"("nuevoLoteId");

-- CreateIndex
CREATE UNIQUE INDEX "lote_union_eventos_txHash_logIndex_key" ON "lote_union_eventos"("txHash", "logIndex");

-- CreateIndex
CREATE INDEX "lote_division_eventos_loteIdOrigen_idx" ON "lote_division_eventos"("loteIdOrigen");

-- CreateIndex
CREATE UNIQUE INDEX "lote_division_eventos_txHash_logIndex_key" ON "lote_division_eventos"("txHash", "logIndex");

-- CreateIndex
CREATE INDEX "traspasos_loteId_idx" ON "traspasos"("loteId");

-- CreateIndex
CREATE INDEX "traspasos_de_idx" ON "traspasos"("de");

-- CreateIndex
CREATE INDEX "traspasos_hacia_idx" ON "traspasos"("hacia");

-- CreateIndex
CREATE INDEX "traspasos_estado_idx" ON "traspasos"("estado");

-- CreateIndex
CREATE INDEX "emisiones_transformadorWallet_idx" ON "emisiones"("transformadorWallet");

-- CreateIndex
CREATE INDEX "emisiones_material_idx" ON "emisiones"("material");

-- CreateIndex
CREATE INDEX "emision_aportes_separadorWallet_idx" ON "emision_aportes"("separadorWallet");

-- CreateIndex
CREATE UNIQUE INDEX "emision_aportes_emisionId_separadorWallet_key" ON "emision_aportes"("emisionId", "separadorWallet");

-- CreateIndex
CREATE INDEX "emision_eslabones_direccion_idx" ON "emision_eslabones"("direccion");

-- CreateIndex
CREATE UNIQUE INDEX "emision_eslabones_emisionId_direccion_key" ON "emision_eslabones"("emisionId", "direccion");

-- CreateIndex
CREATE INDEX "ventas_primarias_emisionId_idx" ON "ventas_primarias"("emisionId");

-- CreateIndex
CREATE INDEX "ventas_primarias_compradorWallet_idx" ON "ventas_primarias"("compradorWallet");

-- CreateIndex
CREATE UNIQUE INDEX "ventas_primarias_txHash_logIndex_key" ON "ventas_primarias"("txHash", "logIndex");

-- CreateIndex
CREATE INDEX "pagos_acreditados_destinatario_idx" ON "pagos_acreditados"("destinatario");

-- CreateIndex
CREATE INDEX "pagos_acreditados_emisionId_idx" ON "pagos_acreditados"("emisionId");

-- CreateIndex
CREATE UNIQUE INDEX "pagos_acreditados_txHash_logIndex_key" ON "pagos_acreditados"("txHash", "logIndex");

-- CreateIndex
CREATE INDEX "pagos_retiros_destinatario_idx" ON "pagos_retiros"("destinatario");

-- CreateIndex
CREATE UNIQUE INDEX "pagos_retiros_txHash_logIndex_key" ON "pagos_retiros"("txHash", "logIndex");

-- CreateIndex
CREATE INDEX "certificado_retiros_compradorWallet_idx" ON "certificado_retiros"("compradorWallet");

-- CreateIndex
CREATE INDEX "certificado_retiros_material_idx" ON "certificado_retiros"("material");

-- CreateIndex
CREATE UNIQUE INDEX "certificado_retiros_txHash_logIndex_key" ON "certificado_retiros"("txHash", "logIndex");

-- CreateIndex
CREATE INDEX "raw_events_processed_idx" ON "raw_events"("processed");

-- CreateIndex
CREATE UNIQUE INDEX "raw_events_txHash_logIndex_key" ON "raw_events"("txHash", "logIndex");

-- CreateIndex
CREATE UNIQUE INDEX "indexer_state_chainId_key" ON "indexer_state"("chainId");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_email_key" ON "accounts"("email");

-- AddForeignKey
ALTER TABLE "entregas" ADD CONSTRAINT "entregas_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "lotes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entregas" ADD CONSTRAINT "entregas_separadorWallet_fkey" FOREIGN KEY ("separadorWallet") REFERENCES "separadores"("wallet") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entregas" ADD CONSTRAINT "entregas_receptorWallet_fkey" FOREIGN KEY ("receptorWallet") REFERENCES "intermediarios"("wallet") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lote_union_eventos" ADD CONSTRAINT "lote_union_eventos_nuevoLoteId_fkey" FOREIGN KEY ("nuevoLoteId") REFERENCES "lotes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lote_division_eventos" ADD CONSTRAINT "lote_division_eventos_loteIdOrigen_fkey" FOREIGN KEY ("loteIdOrigen") REFERENCES "lotes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "traspasos" ADD CONSTRAINT "traspasos_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "lotes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emisiones" ADD CONSTRAINT "emisiones_transformadorWallet_fkey" FOREIGN KEY ("transformadorWallet") REFERENCES "transformadores"("wallet") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emision_aportes" ADD CONSTRAINT "emision_aportes_emisionId_fkey" FOREIGN KEY ("emisionId") REFERENCES "emisiones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emision_aportes" ADD CONSTRAINT "emision_aportes_separadorWallet_fkey" FOREIGN KEY ("separadorWallet") REFERENCES "separadores"("wallet") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emision_eslabones" ADD CONSTRAINT "emision_eslabones_emisionId_fkey" FOREIGN KEY ("emisionId") REFERENCES "emisiones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emision_eslabones" ADD CONSTRAINT "emision_eslabones_direccion_fkey" FOREIGN KEY ("direccion") REFERENCES "intermediarios"("wallet") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventas_primarias" ADD CONSTRAINT "ventas_primarias_emisionId_fkey" FOREIGN KEY ("emisionId") REFERENCES "emisiones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventas_primarias" ADD CONSTRAINT "ventas_primarias_compradorWallet_fkey" FOREIGN KEY ("compradorWallet") REFERENCES "compradores"("wallet") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos_acreditados" ADD CONSTRAINT "pagos_acreditados_ventaId_fkey" FOREIGN KEY ("ventaId") REFERENCES "ventas_primarias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificado_retiros" ADD CONSTRAINT "certificado_retiros_compradorWallet_fkey" FOREIGN KEY ("compradorWallet") REFERENCES "compradores"("wallet") ON DELETE RESTRICT ON UPDATE CASCADE;
