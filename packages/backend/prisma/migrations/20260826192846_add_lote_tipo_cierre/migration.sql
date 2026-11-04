-- CreateTable
CREATE TABLE "lote_tipo_cierres" (
    "id" SERIAL NOT NULL,
    "loteId" BIGINT NOT NULL,
    "tipoPlastico" "TipoPlastico" NOT NULL,
    "pesoOficialGramos" DECIMAL(78,0) NOT NULL,
    "factorAjuste" DECIMAL(20,0) NOT NULL,
    "blockNumber" BIGINT NOT NULL,
    "txHash" VARCHAR(66) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lote_tipo_cierres_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lote_tipo_cierres_loteId_tipoPlastico_key" ON "lote_tipo_cierres"("loteId", "tipoPlastico");

-- AddForeignKey
ALTER TABLE "lote_tipo_cierres" ADD CONSTRAINT "lote_tipo_cierres_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "municipal_batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
