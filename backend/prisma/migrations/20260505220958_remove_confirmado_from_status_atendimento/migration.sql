/*
  Warnings:

  - The values [CONFIRMADO] on the enum `StatusAtendimento` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "StatusAtendimento_new" AS ENUM ('AGENDADO', 'CANCELADO', 'FINALIZADO');
ALTER TABLE "public"."agendas" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "agendas" ALTER COLUMN "status" TYPE "StatusAtendimento_new" USING ("status"::text::"StatusAtendimento_new");
ALTER TYPE "StatusAtendimento" RENAME TO "StatusAtendimento_old";
ALTER TYPE "StatusAtendimento_new" RENAME TO "StatusAtendimento";
DROP TYPE "public"."StatusAtendimento_old";
ALTER TABLE "agendas" ALTER COLUMN "status" SET DEFAULT 'AGENDADO';
COMMIT;
