-- AlterTable: agregar como nullable primero, para poder rellenar filas existentes.
ALTER TABLE "transacciones" ADD COLUMN "pesoGramosDeclarado" DECIMAL(78,0);

-- Backfill: para filas ya existentes no tenemos el valor original si ya fueron reconciliadas
-- (pesoGramos se sobreescribio en la chain) -- se usa el valor actual como mejor aproximacion
-- disponible. De aca en adelante el indexer siempre fija este campo al crear la fila y nunca
-- lo vuelve a tocar, asi que no vuelve a pasar.
UPDATE "transacciones" SET "pesoGramosDeclarado" = "pesoGramos" WHERE "pesoGramosDeclarado" IS NULL;

ALTER TABLE "transacciones" ALTER COLUMN "pesoGramosDeclarado" SET NOT NULL;
