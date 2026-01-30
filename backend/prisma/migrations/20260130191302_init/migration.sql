/*
  Warnings:

  - You are about to drop the `Agenda` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Attend` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Doctor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Agenda" DROP CONSTRAINT "Agenda_docId_fkey";

-- DropForeignKey
ALTER TABLE "Agenda" DROP CONSTRAINT "Agenda_pantId_fkey";

-- DropForeignKey
ALTER TABLE "Attend" DROP CONSTRAINT "Attend_userId_fkey";

-- DropForeignKey
ALTER TABLE "Doctor" DROP CONSTRAINT "Doctor_userId_fkey";

-- DropTable
DROP TABLE "Agenda";

-- DropTable
DROP TABLE "Attend";

-- DropTable
DROP TABLE "Doctor";

-- DropTable
DROP TABLE "Users";

-- CreateTable
CREATE TABLE "agendas" (
    "id" TEXT NOT NULL,
    "horario_atend" TIMESTAMP(3) NOT NULL,
    "statusUrgencia" "StatusUrgencia" NOT NULL DEFAULT 'BAIXO',
    "status" "StatusAtendimento" NOT NULL DEFAULT 'AGENDADO',
    "pantId" INTEGER NOT NULL,
    "docId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agendas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "cpf" VARCHAR(11) NOT NULL,
    "nascimento" TIMESTAMP(3) NOT NULL,
    "fone" VARCHAR(11) NOT NULL,
    "email" TEXT NOT NULL,
    "password" VARCHAR(60) NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctors" (
    "userId" INTEGER NOT NULL,
    "crm" TEXT NOT NULL,
    "especialidade" TEXT NOT NULL,

    CONSTRAINT "doctors_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "attends" (
    "userId" INTEGER NOT NULL,
    "setor" TEXT NOT NULL,

    CONSTRAINT "attends_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_cpf_key" ON "users"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "doctors_crm_key" ON "doctors"("crm");

-- AddForeignKey
ALTER TABLE "agendas" ADD CONSTRAINT "agendas_pantId_fkey" FOREIGN KEY ("pantId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendas" ADD CONSTRAINT "agendas_docId_fkey" FOREIGN KEY ("docId") REFERENCES "doctors"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attends" ADD CONSTRAINT "attends_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
