import { prisma } from "../lib/prisma.js";
import { startOfDay, endOfDay, startOfMonth, endOfMonth, addDays } from "date-fns";

export class DashboardRepository {
  async getGeneralStats() {
    const hoje = new Date();
    const inicioHoje = startOfDay(hoje);
    const fimHoje = endOfDay(hoje);
    const inicioMes = startOfMonth(hoje);
    const fimMes = endOfMonth(hoje);

    const [
      totalPacientes,
      pacientesUrgentes,
      agendamentosHoje,
      agendamentosTotal,
      agendamentosUrgentes,
      totalMedicos,
      totalAtendentes,
      finalizadosMes,
      agendamentosMes,
    ] = await Promise.all([
      prisma.patient.count(),
      // pacientes que possuem ao menos uma agenda urgente pendente
      prisma.patient.count({
        where: {
          agendas: {
            some: {
              statusUrgencia: "URGENTE",
              status: { in: ["AGENDADO"] },
            },
          },
        },
      }),
      prisma.agenda.count({
        where: { horario_atend: { gte: inicioHoje, lte: fimHoje } },
      }),
      prisma.agenda.count(),
      prisma.agenda.count({
        where: {
          statusUrgencia: "URGENTE",
          status: { in: ["AGENDADO"] },
        },
      }),
      prisma.user.count({ where: { role: "MEDICO" } }),
      prisma.user.count({ where: { role: "ATENDENTE" } }),
      prisma.agenda.count({
        where: {
          status: "FINALIZADO",
          horario_atend: { gte: inicioMes, lte: fimMes },
        },
      }),
      prisma.agenda.count({
        where: { horario_atend: { gte: inicioMes, lte: fimMes } },
      }),
    ]);

    const taxaConclusao =
      agendamentosMes > 0 ? Math.round((finalizadosMes / agendamentosMes) * 100) : 0;

    return {
      totalPacientes,
      pacientesUrgentes,
      agendamentosHoje,
      agendamentosTotal,
      agendamentosUrgentes,
      totalMedicos,
      totalAtendentes,
      profissionaisAtivos: totalMedicos + totalAtendentes,
      taxaConclusao,
      finalizadosMes,
    };
  }

  async getMedicoStats(userId: string) {
    const hoje = new Date();
    const inicioHoje = startOfDay(hoje);
    const fimHoje = endOfDay(hoje);
    const fim7Dias = endOfDay(addDays(hoje, 7));
    const inicioMes = startOfMonth(hoje);
    const fimMes = endOfMonth(hoje);

    const [hojeCount, prox7Dias, atendidosMes] = await Promise.all([
      prisma.agenda.count({
        where: { docId: userId, horario_atend: { gte: inicioHoje, lte: fimHoje } },
      }),
      prisma.agenda.count({
        where: { docId: userId, horario_atend: { gte: inicioHoje, lte: fim7Dias } },
      }),
      prisma.agenda.count({
        where: {
          docId: userId,
          status: "FINALIZADO",
          horario_atend: { gte: inicioMes, lte: fimMes },
        },
      }),
    ]);

    return { hojeCount, prox7Dias, atendidosMes };
  }

  async getAgendamentosHoje(userId?: string) {
    const inicio = startOfDay(new Date());
    const fim = endOfDay(new Date());

    return prisma.agenda.findMany({
      where: {
        horario_atend: { gte: inicio, lte: fim },
        ...(userId ? { docId: userId } : {}),
      },
      include: {
        paciente: { select: { id: true, nome: true, fone: true } },
        medico: {
          select: {
            userId: true,
            especialidade: true,
            user: { select: { nome: true, avatar: true } },
          },
        },
      },
      orderBy: { horario_atend: "asc" },
      take: 5,
    });
  }

  async getMedicosDisponiveisHoje() {
    const diaHoje = new Date().getDay(); // 0=Dom, 6=Sáb

    return prisma.doctor.findMany({
      where: {
        disponibilidades: {
          some: { diaSemana: diaHoje },
        },
      },
      select: {
        userId: true,
        crm: true,
        especialidade: true,
        user: { select: { nome: true, email: true, avatar: true } },
        disponibilidades: {
          where: { diaSemana: diaHoje },
          select: { horaInicio: true, horaFim: true },
        },
      },
      take: 8,
    });
  }
}