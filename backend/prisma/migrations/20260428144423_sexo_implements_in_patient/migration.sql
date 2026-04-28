-- CreateEnum
CREATE TYPE "Sexo" AS ENUM ('MASCULINO', 'FEMININO', 'OUTRO');

-- AlterTable
ALTER TABLE "patients" ADD COLUMN     "sexo" "Sexo" NOT NULL DEFAULT 'OUTRO';
