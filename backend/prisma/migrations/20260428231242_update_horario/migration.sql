/*
  Warnings:

  - A unique constraint covering the columns `[docId,diaSemana]` on the table `disponibilidades` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "disponibilidades_docId_diaSemana_key" ON "disponibilidades"("docId", "diaSemana");
