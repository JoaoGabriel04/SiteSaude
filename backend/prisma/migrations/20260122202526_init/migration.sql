/*
  Warnings:

  - You are about to drop the `UserTest` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "StatusUrgencia" AS ENUM ('URGENTE', 'MODERADO', 'BAIXO');

-- CreateEnum
CREATE TYPE "StatusAtendimento" AS ENUM ('AGENDADO', 'CONFIRMADO', 'CANCELADO', 'FINALIZADO');

-- DropTable
DROP TABLE "UserTest";

-- CreateTable
CREATE TABLE "Agenda" (
    "id" TEXT NOT NULL,
    "horario_atend" TIMESTAMP(3) NOT NULL,
    "statusUrgencia" "StatusUrgencia" NOT NULL,
    "status" "StatusAtendimento" NOT NULL DEFAULT 'AGENDADO',
    "pantId" INTEGER NOT NULL,
    "docId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agenda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Users" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "nascimento" TIMESTAMP(3) NOT NULL,
    "fone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Doctor" (
    "userId" INTEGER NOT NULL,
    "crm" TEXT NOT NULL,
    "especialidade" TEXT NOT NULL,

    CONSTRAINT "Doctor_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Pantient" (
    "userId" INTEGER NOT NULL,
    "cartaoSus" TEXT NOT NULL,

    CONSTRAINT "Pantient_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Attend" (
    "userId" INTEGER NOT NULL,
    "setor" TEXT,

    CONSTRAINT "Attend_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_cpf_key" ON "Users"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_crm_key" ON "Doctor"("crm");

-- CreateIndex
CREATE UNIQUE INDEX "Pantient_cartaoSus_key" ON "Pantient"("cartaoSus");

-- AddForeignKey
ALTER TABLE "Agenda" ADD CONSTRAINT "Agenda_pantId_fkey" FOREIGN KEY ("pantId") REFERENCES "Pantient"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agenda" ADD CONSTRAINT "Agenda_docId_fkey" FOREIGN KEY ("docId") REFERENCES "Doctor"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Doctor" ADD CONSTRAINT "Doctor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pantient" ADD CONSTRAINT "Pantient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attend" ADD CONSTRAINT "Attend_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
