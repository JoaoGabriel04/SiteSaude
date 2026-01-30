/*
  Warnings:

  - The values [PACIENTE] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - The primary key for the `Pantient` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `userId` on the `Pantient` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cpf]` on the table `Pantient` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cpf` to the `Pantient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nascimento` to the `Pantient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nome` to the `Pantient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `telefone` to the `Pantient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Pantient` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('MEDICO', 'ATENDENTE', 'ADMIN');
ALTER TABLE "public"."Users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "Users" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Agenda" DROP CONSTRAINT "Agenda_pantId_fkey";

-- DropForeignKey
ALTER TABLE "Pantient" DROP CONSTRAINT "Pantient_userId_fkey";

-- AlterTable
ALTER TABLE "Agenda" ALTER COLUMN "statusUrgencia" SET DEFAULT 'BAIXO';

-- AlterTable
ALTER TABLE "Pantient" DROP CONSTRAINT "Pantient_pkey",
DROP COLUMN "userId",
ADD COLUMN     "cpf" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "nascimento" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "nome" TEXT NOT NULL,
ADD COLUMN     "telefone" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD CONSTRAINT "Pantient_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Users" ALTER COLUMN "role" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "Pantient_cpf_key" ON "Pantient"("cpf");

-- AddForeignKey
ALTER TABLE "Agenda" ADD CONSTRAINT "Agenda_pantId_fkey" FOREIGN KEY ("pantId") REFERENCES "Pantient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
