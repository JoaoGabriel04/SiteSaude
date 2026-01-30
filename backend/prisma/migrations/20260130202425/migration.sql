/*
  Warnings:

  - The values [GITHUB] on the enum `AuthProvider` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `pantId` on the `agendas` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[provider,providerId]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `patientId` to the `agendas` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AuthProvider_new" AS ENUM ('CREDENTIALS', 'GOOGLE');
ALTER TABLE "public"."users" ALTER COLUMN "provider" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "provider" TYPE "AuthProvider_new" USING ("provider"::text::"AuthProvider_new");
ALTER TYPE "AuthProvider" RENAME TO "AuthProvider_old";
ALTER TYPE "AuthProvider_new" RENAME TO "AuthProvider";
DROP TYPE "public"."AuthProvider_old";
ALTER TABLE "users" ALTER COLUMN "provider" SET DEFAULT 'CREDENTIALS';
COMMIT;

-- DropForeignKey
ALTER TABLE "agendas" DROP CONSTRAINT "agendas_pantId_fkey";

-- DropIndex
DROP INDEX "users_provider_providerId_idx";

-- AlterTable
ALTER TABLE "agendas" DROP COLUMN "pantId",
ADD COLUMN     "patientId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_provider_providerId_key" ON "users"("provider", "providerId");

-- AddForeignKey
ALTER TABLE "agendas" ADD CONSTRAINT "agendas_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
