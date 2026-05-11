-- DropForeignKey
ALTER TABLE "solicitacoes_ausencia_dias" DROP CONSTRAINT "solicitacoes_ausencia_dias_solicitacaoId_fkey";

-- AddForeignKey
ALTER TABLE "solicitacoes_ausencia_dias" ADD CONSTRAINT "solicitacoes_ausencia_dias_solicitacaoId_fkey" FOREIGN KEY ("solicitacaoId") REFERENCES "solicitacoes_ausencia"("id") ON DELETE CASCADE ON UPDATE CASCADE;
