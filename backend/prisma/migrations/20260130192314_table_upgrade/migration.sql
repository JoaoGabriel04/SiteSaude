/*
  Warnings:

  - The primary key for the `Patient` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `attends` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `doctors` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('CREDENTIALS', 'GOOGLE', 'GITHUB');

-- DropForeignKey
ALTER TABLE "agendas" DROP CONSTRAINT "agendas_docId_fkey";

-- DropForeignKey
ALTER TABLE "agendas" DROP CONSTRAINT "agendas_pantId_fkey";

-- DropForeignKey
ALTER TABLE "attends" DROP CONSTRAINT "attends_userId_fkey";

-- DropForeignKey
ALTER TABLE "doctors" DROP CONSTRAINT "doctors_userId_fkey";

-- AlterTable
ALTER TABLE "Patient" DROP CONSTRAINT "Patient_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Patient_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Patient_id_seq";

-- AlterTable
ALTER TABLE "agendas" ALTER COLUMN "pantId" SET DATA TYPE TEXT,
ALTER COLUMN "docId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "attends" DROP CONSTRAINT "attends_pkey",
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "attends_pkey" PRIMARY KEY ("userId");

-- AlterTable
ALTER TABLE "doctors" DROP CONSTRAINT "doctors_pkey",
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "doctors_pkey" PRIMARY KEY ("userId");

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "provider" "AuthProvider" NOT NULL DEFAULT 'CREDENTIALS',
ADD COLUMN     "providerId" TEXT,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "password" DROP NOT NULL,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "users_id_seq";

-- CreateIndex
CREATE INDEX "users_provider_providerId_idx" ON "users"("provider", "providerId");

-- AddForeignKey
ALTER TABLE "agendas" ADD CONSTRAINT "agendas_pantId_fkey" FOREIGN KEY ("pantId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendas" ADD CONSTRAINT "agendas_docId_fkey" FOREIGN KEY ("docId") REFERENCES "doctors"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attends" ADD CONSTRAINT "attends_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
