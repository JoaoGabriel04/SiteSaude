/*
  Warnings:

  - Made the column `setor` on table `Attend` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Attend" ALTER COLUMN "setor" SET NOT NULL;
