/*
  Warnings:

  - You are about to drop the `Pantient` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Agenda" DROP CONSTRAINT "Agenda_pantId_fkey";

-- DropTable
DROP TABLE "Pantient";

-- CreateTable
CREATE TABLE "Patient" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "nascimento" TIMESTAMP(3) NOT NULL,
    "fone" TEXT NOT NULL,
    "email" TEXT,
    "cartaoSus" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Patient_cpf_key" ON "Patient"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_cartaoSus_key" ON "Patient"("cartaoSus");

-- AddForeignKey
ALTER TABLE "Agenda" ADD CONSTRAINT "Agenda_pantId_fkey" FOREIGN KEY ("pantId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
