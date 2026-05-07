-- AlterTable
ALTER TABLE "agendas" ADD COLUMN     "attendUserId" TEXT,
ADD COLUMN     "canceledAt" TIMESTAMP(3),
ADD COLUMN     "canceledById" TEXT;

-- AddForeignKey
ALTER TABLE "agendas" ADD CONSTRAINT "agendas_canceledById_fkey" FOREIGN KEY ("canceledById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendas" ADD CONSTRAINT "agendas_attendUserId_fkey" FOREIGN KEY ("attendUserId") REFERENCES "attends"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
