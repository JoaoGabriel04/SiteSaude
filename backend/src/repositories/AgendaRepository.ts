import { prisma } from "../lib/prisma.js";
import {
  StatusAtendimento,
  StatusUrgencia,
  TipoAtendimento,
} from "../../generated/prisma/index.js";

export default class AgendaRepository {
  
  /* =======================
     CREATE
  ======================= */
  async createAgenda(data: {
    horario_atend: Date;
    duracaoMin: number;
    statusUrgencia: StatusUrgencia;
    status: StatusAtendimento;
    tipo: TipoAtendimento;
    patientId: string;
    docId: string;
    createdById: string;
    cancelReason?: string;
    motivo?: string;
    observacoes?: string;
  }) {
    console.log("Criando agenda com:", {
      docId: data.docId,
      createdById: data.createdById,
      patientId: data.patientId,
    });

    return prisma.agenda.create({
      data: {
        horario_atend: data.horario_atend,
        duracaoMin: data.duracaoMin,
        statusUrgencia: data.statusUrgencia,
        status: data.status,
        tipo: data.tipo,
        cancelReason: data.cancelReason,
        motivo: data.motivo,
        observacoes: data.observacoes,
        paciente: { connect: { id: data.patientId } },
        medico: { connect: { userId: data.docId } },
        createdBy: { connect: { id: data.createdById } },
      },
    });
  }

  /* =======================
     QUERIES (gerais)
  ======================= */
  async findAgendamentos(where: any, page: number) {
    const limit = 12;
    return prisma.agenda.findMany({
      where,
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { horario_atend: "asc" },
      include: {
        paciente: {
          select: { id: true, nome: true, cpf: true, fone: true, nascimento: true, email: true, sexo: true, cartaoSus: true },
        },
        medico: {
          select: {
            userId: true,
            crm: true,
            especialidade: true,
            user: { select: { nome: true } },
          },
        },
        canceledBy: {
          select: { nome: true },
        },
      },
    });
  }

  async findAgendamentosByDocEData(docId: string, data: Date) {
    const inicio = new Date(Date.UTC(
      data.getUTCFullYear(),
      data.getUTCMonth(),
      data.getUTCDate(),
      0, 0, 0, 0
    ));
    const fim = new Date(Date.UTC(
      data.getUTCFullYear(),
      data.getUTCMonth(),
      data.getUTCDate(),
      23, 59, 59, 999
    ));
  
    return prisma.agenda.findMany({
      where: {
        docId,
        horario_atend: { gte: inicio, lte: fim },
        status: { notIn: ["CANCELADO", "FINALIZADO"] },
      },
      orderBy: { horario_atend: "asc" },
    });
  }

  async findAgendamentosByPatientEHorario(patientId: string, data: Date) {
    const inicio = new Date(Date.UTC(
      data.getUTCFullYear(),
      data.getUTCMonth(),
      data.getUTCDate(),
      0, 0, 0, 0
    ));
    const fim = new Date(Date.UTC(
      data.getUTCFullYear(),
      data.getUTCMonth(),
      data.getUTCDate(),
      23, 59, 59, 999
    ));

    return prisma.agenda.findMany({
      where: {
        patientId,
        horario_atend: { gte: inicio, lte: fim },
        status: { notIn: ["CANCELADO", "FINALIZADO"] },
      },
      orderBy: { horario_atend: "asc" },
    });
  }

  async findExcecaoByDocEData(docId: string, data: Date) {
    const inicio = new Date(Date.UTC(
      data.getUTCFullYear(),
      data.getUTCMonth(),
      data.getUTCDate(),
      0, 0, 0, 0
    ));
    const fim = new Date(Date.UTC(
      data.getUTCFullYear(),
      data.getUTCMonth(),
      data.getUTCDate(),
      23, 59, 59, 999
    ));

    return prisma.excecaoMedico.findFirst({
      where: {
        docId,
        data: { gte: inicio, lte: fim },
        status: "APROVADO",
      },
    });
  }

  async findSolicitacaoAusenciaByData(docId: string, data: Date) {
    const inicio = new Date(Date.UTC(
      data.getUTCFullYear(),
      data.getUTCMonth(),
      data.getUTCDate(),
      0, 0, 0, 0
    ));
    const fim = new Date(Date.UTC(
      data.getUTCFullYear(),
      data.getUTCMonth(),
      data.getUTCDate(),
      23, 59, 59, 999
    ));

    return prisma.solicitacaoAusencia.findFirst({
      where: {
        docId,
        status: "APROVADO",
        dias: {
          some: {
            data: { gte: inicio, lte: fim }
          }
        }
      },
      include: { dias: true }
    });
  }

  async checkHour(docId: string) {
    return prisma.agenda.findFirst({ where: { docId } });
  }

  /* =======================
     MEUS AGENDAMENTOS (médico)
  ======================= */
  async findMeusAgendamentos(params: {
    docId: string;
    busca?: string;
    periodo?: "hoje" | "posteriores" | "passados" | "todos";
    status?: StatusAtendimento;
    page: number;
    limit: number;
  }) {
    const { docId, busca, periodo = "todos", status, page, limit } = params;

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);
    const limite30 = new Date(hoje);
    limite30.setDate(limite30.getDate() + 30);
    limite30.setHours(23, 59, 59, 999);

    let dataFilter: any = {};
    if (periodo === "hoje") dataFilter = { gte: hoje, lt: amanha };
    else if (periodo === "posteriores") dataFilter = { gte: amanha, lte: limite30 };
    else if (periodo === "passados") dataFilter = { lt: hoje };

    const where: any = {
      docId,
      ...(Object.keys(dataFilter).length && { horario_atend: dataFilter }),
      // Por padrão, excluír FINALIZADO - para aparecer apenas na página de Finalizados
      ...(status 
        ? { status } 
        : { status: { not: "FINALIZADO" } }
      ),
      ...(busca && {
        OR: [
          { paciente: { nome: { contains: busca, mode: "insensitive" } } },
          { motivo: { contains: busca, mode: "insensitive" } },
          { paciente: { cpf: { contains: busca } } },
          { paciente: { fone: { contains: busca } } },
        ],
      }),
    };

    const [agendamentos, total] = await Promise.all([
      prisma.agenda.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { horario_atend: periodo === "passados" ? "desc" : "asc" },
        include: {
          paciente: {
            select: {
              id: true,
              nome: true,
              cpf: true,
              fone: true,
              nascimento: true,
              sexo: true,
            },
          },
        },
      }),
      prisma.agenda.count({ where }),
    ]);

    return { agendamentos, total };
  }

  /* =======================
     UPDATE / DELETE
  ======================= */
  async findById(id: string) {
    return prisma.agenda.findUnique({
      where: { id },
      include: {
        paciente: true,
        medico: { include: { user: true } },
        createdBy: { select: { nome: true } },
        canceledBy: { select: { nome: true } },
      },
    });
  }

  async updateStatus(id: string, status: StatusAtendimento, cancelReason?: string, canceledById?: string) {
    return prisma.agenda.update({
      where: { id },
      data: {
        status,
        ...(cancelReason && { cancelReason }),
        ...(canceledById && { canceledById }),
        ...(status === "CANCELADO" ? { canceledAt: new Date() } : {}),
      },
    });
  }

  async restoreStatus(id: string) {
    return prisma.agenda.update({
      where: { id },
      data: {
        status: "AGENDADO",
        cancelReason: null,
        canceledById: null,
        canceledAt: null,
      },
    });
  }

  async deleteAgenda(id: string) {
    return prisma.agenda.delete({ where: { id } });
  }
}