/*
  Warnings:

  - You are about to drop the column `status` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "doctors" ADD COLUMN     "status" "StatusProfissional" NOT NULL DEFAULT 'ATIVO';

-- AlterTable
ALTER TABLE "users" DROP COLUMN "status";
