-- CreateTable
CREATE TABLE "disponibilidades" (
    "id" TEXT NOT NULL,
    "docId" TEXT NOT NULL,
    "diaSemana" INTEGER NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFim" TEXT NOT NULL,

    CONSTRAINT "disponibilidades_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "disponibilidades" ADD CONSTRAINT "disponibilidades_docId_fkey" FOREIGN KEY ("docId") REFERENCES "doctors"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
