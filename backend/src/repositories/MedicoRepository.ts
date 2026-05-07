import { prisma } from "../lib/prisma.js";

export default class MedicoRepository {

  /* =======================
     DISPONIBILIDADE
  ======================= */

  async createDisponibilidade(data: {
    docId: string;
    diaSemana: number;
    horaInicio: string;
    horaFim: string;
    almocoInicio?: string;
    almocoFim?: string;
  }) {
    return prisma.disponibilidade.upsert({
      where: {
        docId_diaSemana: {
          docId: data.docId,
          diaSemana: data.diaSemana
        }
      },
      update: {
        horaInicio: data.horaInicio,
        horaFim: data.horaFim,
        almocoInicio: data.almocoInicio,
        almocoFim: data.almocoFim
      },
      create: data
    });
  }

  async findDisponibilidadeByDoc(docId: string) {
    return prisma.disponibilidade.findMany({
      where: { docId },
      orderBy: { diaSemana: 'asc' }
    });
  }

  async findDisponibilidadeByDia(docId: string, diaSemana: number) {
    return prisma.disponibilidade.findFirst({
      where: { docId, diaSemana }
    });
  }

  async deleteDisponibilidade(id: string) {
    return prisma.disponibilidade.delete({
      where: { id }
    });
  }

  /* =======================
     EXCEÇÕES
  ======================= */

  async createExcecao(data: {
    docId: string;
    data: Date;
    motivo?: string;
  }) {
    return prisma.excecaoMedico.create({ data });
  }

  async findExcecaoByDocEData(docId: string, data: Date) {
    const inicio = new Date(data);
    inicio.setHours(0, 0, 0, 0);

    const fim = new Date(data);
    fim.setHours(23, 59, 59, 999);

    return prisma.excecaoMedico.findFirst({
      where: {
        docId,
        data: {
          gte: inicio,
          lte: fim
        }
      }
    });
  }

  async findExcecoesByDoc(docId: string) {
    return prisma.excecaoMedico.findMany({
      where: { docId },
      orderBy: { data: 'asc' }
    });
  }

  async deleteExcecao(id: string) {
    return prisma.excecaoMedico.delete({
      where: { id }
    });
  }
}