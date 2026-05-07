-- CreateEnum
CREATE TYPE "StatusProfissional" AS ENUM ('ATIVO', 'INATIVO');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "status" "StatusProfissional" NOT NULL DEFAULT 'ATIVO';
