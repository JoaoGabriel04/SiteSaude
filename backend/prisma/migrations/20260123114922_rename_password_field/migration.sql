/*
  Warnings:

  - You are about to alter the column `nome` on the `Users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `cpf` on the `Users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(11)`.
  - You are about to alter the column `fone` on the `Users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(11)`.
  - You are about to alter the column `password` on the `Users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(60)`.

*/
-- AlterTable
ALTER TABLE "Users" ALTER COLUMN "nome" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "cpf" SET DATA TYPE VARCHAR(11),
ALTER COLUMN "fone" SET DATA TYPE VARCHAR(11),
ALTER COLUMN "password" SET DATA TYPE VARCHAR(60);
