/*
  Warnings:

  - Added the required column `createdById` to the `agendas` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TipoAtendimento" AS ENUM ('CONSULTA', 'EXAME', 'PROCEDIMENTO', 'RETORNO');

-- AlterTable
ALTER TABLE "agendas" ADD COLUMN     "cancelReason" TEXT,
ADD COLUMN     "createdById" TEXT NOT NULL,
ADD COLUMN     "duracaoMin" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "locked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "motivo" TEXT,
ADD COLUMN     "observacoes" TEXT,
ADD COLUMN     "tipo" "TipoAtendimento" NOT NULL DEFAULT 'CONSULTA';

-- AddForeignKey
ALTER TABLE "agendas" ADD CONSTRAINT "agendas_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
