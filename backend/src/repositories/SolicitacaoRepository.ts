import { prisma } from "../lib/prisma.js";
import { StatusSolicitacao } from "../../generated/prisma/index.js";

export default class SolicitacaoRepository {

  async create(data: {
    docId: string;
    motivo?: string;
    datas: Date[];
  }) {
    return prisma.solicitacaoAusencia.create({
      data: {
        docId: data.docId,
        motivo: data.motivo,
        dias: {
          create: data.datas.map(d => ({ data: d }))
        }
      },
      include: {
        medico: {
          include: {
            user: {
              select: { id: true, nome: true, email: true }
            }
          }
        },
        dias: true
      }
    });
  }

  async findById(id: string) {
    return prisma.solicitacaoAusencia.findUnique({
      where: { id },
      include: {
        medico: {
          include: {
            user: {
              select: { id: true, nome: true, email: true }
            }
          }
        },
        dias: {
          orderBy: { data: "asc" }
        },
        aprovadoPor: {
          select: { nome: true }
        }
      }
    });
  }

  async findPendentes() {
    return prisma.solicitacaoAusencia.findMany({
      where: { status: "PENDENTE" },
      orderBy: { dataSolicitacao: "asc" },
      include: {
        medico: {
          include: {
            user: {
              select: { id: true, nome: true, email: true }
            }
          }
        },
        dias: {
          orderBy: { data: "asc" }
        }
      }
    });
  }

  async findByDocId(docId: string) {
    return prisma.solicitacaoAusencia.findMany({
      where: { docId },
      orderBy: { dataSolicitacao: "desc" },
      include: {
        dias: {
          orderBy: { data: "asc" }
        },
        aprovadoPor: {
          select: { nome: true }
        }
      }
    });
  }

  async approve(id: string, aprovadoPorId: string) {
    return prisma.solicitacaoAusencia.update({
      where: { id },
      data: {
        status: "APROVADO",
        aprovadoPorId,
        dataResposta: new Date()
      }
    });
  }

  async deny(id: string, aprovadoPorId: string, observacao: string) {
    return prisma.solicitacaoAusencia.update({
      where: { id },
      data: {
        status: "NEGADO",
        aprovadoPorId,
        observacaoAdmin: observacao,
        dataResposta: new Date()
      }
    });
  }

  async findApprovedByDocId(docId: string) {
    return prisma.solicitacaoAusencia.findMany({
      where: { docId, status: "APROVADO" },
      include: {
        dias: {
          orderBy: { data: "asc" }
        }
      }
    });
  }

  async delete(id: string) {
    return prisma.$transaction(async (tx) => {
      await tx.solicitacaoAusenciaDia.deleteMany({
        where: { solicitacaoId: id }
      });
      return tx.solicitacaoAusencia.delete({
        where: { id }
      });
    });
  }

  async hasConflict(docId: string, datas: Date[], excludeId?: string) {
    for (const data of datas) {
      const start = new Date(data);
      start.setHours(0, 0, 0, 0);
      const end = new Date(data);
      end.setHours(23, 59, 59, 999);

      const where: any = {
        docId,
        status: "APROVADO",
        dias: {
          some: {
            data: {
              gte: start,
              lte: end
            }
          }
        }
      };

      if (excludeId) {
        where.NOT = { id: excludeId };
      }

      const existing = await prisma.solicitacaoAusencia.findFirst({
        where,
        include: { dias: true }
      });

      if (existing) return true;
    }

    return false;
  }

  async hasPendingConflict(docId: string, datas: Date[]) {
    for (const data of datas) {
      const start = new Date(data);
      start.setHours(0, 0, 0, 0);
      const end = new Date(data);
      end.setHours(23, 59, 59, 999);

      const existing = await prisma.solicitacaoAusencia.findFirst({
        where: {
          docId,
          status: "PENDENTE",
          dias: {
            some: {
              data: {
                gte: start,
                lte: end
              }
            }
          }
        },
        include: { dias: true }
      });

      if (existing) return true;
    }

    return false;
  }
}