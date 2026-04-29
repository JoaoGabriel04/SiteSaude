-- CreateTable
CREATE TABLE "excecoes_medico" (
    "id" TEXT NOT NULL,
    "docId" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "motivo" TEXT,

    CONSTRAINT "excecoes_medico_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "excecoes_medico_docId_data_key" ON "excecoes_medico"("docId", "data");

-- AddForeignKey
ALTER TABLE "excecoes_medico" ADD CONSTRAINT "excecoes_medico_docId_fkey" FOREIGN KEY ("docId") REFERENCES "doctors"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
