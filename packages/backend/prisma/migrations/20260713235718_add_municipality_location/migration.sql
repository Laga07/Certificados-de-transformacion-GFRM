/*
  Warnings:

  - Added the required column `cantonId` to the `municipalities` table without a default value. This is not possible if the table is not empty.
  - Added the required column `provincia` to the `municipalities` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
-- Los defaults reflejan el estado on-chain real de municipalidades registradas antes de
-- este cambio (los campos nuevos del struct quedaron en 0 = SanJose/canton 0 tras el upgrade).
ALTER TABLE "municipalities" ADD COLUMN     "cantonId" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "provincia" "Provincia" NOT NULL DEFAULT 'SanJose';

ALTER TABLE "municipalities" ALTER COLUMN "cantonId" DROP DEFAULT;
ALTER TABLE "municipalities" ALTER COLUMN "provincia" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "municipalities_provincia_cantonId_idx" ON "municipalities"("provincia", "cantonId");
