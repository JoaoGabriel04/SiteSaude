-- CreateTable
CREATE TABLE "solicitacoes_ausencia" (
    "id" TEXT NOT NULL,
    "docId" TEXT NOT NULL,
    "motivo" TEXT,
    "status" "StatusSolicitacao" NOT NULL DEFAULT 'PENDENTE',
    "observacaoAdmin" TEXT,
    "aprovadoPorId" TEXT,
    "dataSolicitacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataResposta" TIMESTAMP(3),

    CONSTRAINT "solicitacoes_ausencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solicitacoes_ausencia_dias" (
    "id" TEXT NOT NULL,
    "solicitacaoId" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "solicitacoes_ausencia_dias_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "solicitacoes_ausencia_dias_solicitacaoId_data_key" ON "solicitacoes_ausencia_dias"("solicitacaoId", "data");

-- AddForeignKey
ALTER TABLE "solicitacoes_ausencia" ADD CONSTRAINT "solicitacoes_ausencia_docId_fkey" FOREIGN KEY ("docId") REFERENCES "doctors"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitacoes_ausencia" ADD CONSTRAINT "solicitacoes_ausencia_aprovadoPorId_fkey" FOREIGN KEY ("aprovadoPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitacoes_ausencia_dias" ADD CONSTRAINT "solicitacoes_ausencia_dias_solicitacaoId_fkey" FOREIGN KEY ("solicitacaoId") REFERENCES "solicitacoes_ausencia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
