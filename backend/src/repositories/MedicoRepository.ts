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
        },
        status: "APROVADO"
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

  async createExcecoesEmPeriodo(datas: Date[], docId: string, motivo?: string) {
    const excecoes = datas.map(data => ({
      docId,
      data,
      motivo,
      status: "PENDENTE" as const
    }));
    return prisma.excecaoMedico.createMany({
      data: excecoes,
      skipDuplicates: true
    });
  }

  /* =======================
     SOLICITAÇÕES (PENDENTES)
  ======================= */

  async findSolicitacoesPendentes() {
    return prisma.excecaoMedico.findMany({
      where: { status: "PENDENTE" },
      orderBy: { dataSolicitacao: "asc" },
      include: {
        medico: {
          include: {
            user: {
              select: { id: true, nome: true, email: true }
            }
          }
        }
      }
    });
  }

  async findSolicitacaoById(id: string) {
    return prisma.excecaoMedico.findUnique({
      where: { id },
      include: {
        medico: {
          include: {
            user: {
              select: { id: true, nome: true, email: true }
            }
          }
        },
        aprovadoPor: {
          select: { nome: true }
        }
      }
    });
  }

  async findMinhasSolicitacoes(docId: string) {
    return prisma.excecaoMedico.findMany({
      where: { docId },
      orderBy: { dataSolicitacao: "desc" },
      include: {
        aprovadoPor: {
          select: { nome: true }
        }
      }
    });
  }

  async findExcecoesAprovadasByDoc(docId: string) {
    return prisma.excecaoMedico.findMany({
      where: { docId, status: "APROVADO" },
      orderBy: { data: "asc" }
    });
  }

  async aprovarSolicitacao(id: string, aprovadoPorId: string) {
    return prisma.excecaoMedico.update({
      where: { id },
      data: {
        status: "APROVADO",
        aprovadoPorId,
        dataResposta: new Date()
      }
    });
  }

  async negarSolicitacao(id: string, aprovadoPorId: string, observacao: string) {
    return prisma.excecaoMedico.update({
      where: { id },
      data: {
        status: "NEGADO",
        aprovadoPorId,
        observacaoAdmin: observacao,
        dataResposta: new Date()
      }
    });
  }
}