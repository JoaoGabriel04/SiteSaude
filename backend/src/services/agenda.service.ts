import AgendaRepository from "../repositories/agenda.repository.js";
import UserRepository from "../repositories/user.repository.js";
import { AppError } from "../errors/AppError.js";

import {
  StatusAtendimento,
  StatusUrgencia,
  TipoAtendimento,
} from "../../generated/prisma/index.js";
import type { Prisma, Agenda, ExcecaoMedico } from "../../generated/prisma/index.js";

type CreatedAgenda = Awaited<ReturnType<AgendaRepository["createAgenda"]>>;
type AgendamentoList = Awaited<ReturnType<AgendaRepository["findAgendamentos"]>>;
type MeusAgendamentosResult = Awaited<ReturnType<AgendaRepository["findMeusAgendamentos"]>>;
type AgendaFull = Awaited<ReturnType<AgendaRepository["findById"]>>;
type UpdatedAgenda = Awaited<ReturnType<AgendaRepository["updateStatus"]>>;
type RestoredAgenda = Awaited<ReturnType<AgendaRepository["restoreStatus"]>>;
type DeletedAgenda = Awaited<ReturnType<AgendaRepository["deleteAgenda"]>>;
type Excecao = ExcecaoMedico | null;

type PaginatedAgendamentos = {
  agendamentos: MeusAgendamentosResult["agendamentos"];
  total: number;
  page: number;
  totalPages: number;
};

export class AgendaService {
  constructor(
    private agendaRepository: AgendaRepository,
    private userRepository: UserRepository
  ) {}

  // ============================================
  // LISTAGEM GERAL DE AGENDAMENTOS (admin/atendente)
  // ============================================
  async getAgendamentos(params: {
    busca?: string;
    docId?: string;
    status?: string;
    statusUrgencia?: string;
    data?: string;
    page?: number;
  }): Promise<AgendamentoList> {
    const { busca, docId, status, statusUrgencia, data, page = 1 } = params;
    const where: Prisma.AgendaWhereInput = {};

    if (docId) {
      where.docId = docId;
    }

    // Por padrão, trazer apenas agendamentos ativos (não FINALIZADO, não CANCELADO)
    // Se o usuário filtrar explicitamente por status, usa o filtro dele
    if (status && status !== "TODOS") {
      where.status = status as StatusAtendimento;
    } else {
      // Excluir finalizados e cancelados por padrão
      where.status = { notIn: [StatusAtendimento.FINALIZADO, StatusAtendimento.CANCELADO] };
    }

    if (statusUrgencia && statusUrgencia !== "TODOS") {
      where.statusUrgencia = statusUrgencia as StatusUrgencia;
    }

    if (data) {
      const [ano, mes, dia] = data.split("-").map(Number);
      const inicio = new Date(ano, mes - 1, dia, 0, 0, 0);
      const fim = new Date(ano, mes - 1, dia, 23, 59, 59);
      where.horario_atend = { gte: inicio, lte: fim };
    }

    if (busca) {
      const termo = busca.trim();
      const numValue = termo.replace(/\D/g, "");

      where.OR = [
        { paciente: { nome: { contains: termo, mode: "insensitive" } } },
        { motivo: { contains: termo, mode: "insensitive" } },
        ...(numValue.length >= 10 ? [
          { paciente: { cpf: { contains: numValue } } },
          { paciente: { fone: { contains: numValue } } },
        ] : []),
      ];
    }

    return this.agendaRepository.findAgendamentos(where, page);
  }

  // ============================================
  // CRIAÇÃO DE AGENDAMENTO
  // ============================================
  async registerAgenda(data: Prisma.AgendaUncheckedCreateInput): Promise<CreatedAgenda> {
    let horarioNorm: Date;
    
    const horarioValue = data.horario_atend as string | number | Date;
    
    if (typeof horarioValue === 'number') {
      // Frontend enviou timestamp
      const d = new Date(horarioValue);
      horarioNorm = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes()));
    } else if (typeof horarioValue === 'string') {
      const isoMatch = horarioValue.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
      if (isoMatch) {
        const [, ano, mes, dia, hora, minuto] = isoMatch.map(Number);
        horarioNorm = new Date(Date.UTC(ano, mes - 1, dia, hora, minuto));
      } else if (horarioValue.includes(' ')) {
        const [dataPart, horaPart] = horarioValue.split(' ');
        const [ano, mes, dia] = dataPart.split('-').map(Number);
        const [hora, minuto] = horaPart.split(':').map(Number);
        horarioNorm = new Date(Date.UTC(ano, mes - 1, dia, hora, minuto));
      } else {
        horarioNorm = new Date(horarioValue);
      }
    } else if (horarioValue instanceof Date) {
      const d = horarioValue;
      if (!isNaN(d.getTime())) {
        horarioNorm = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes()));
      } else {
        horarioNorm = new Date(horarioValue);
      }
    } else {
      horarioNorm = new Date(horarioValue);
    }

    const agora = new Date();

    if (horarioNorm < agora) {
      throw new AppError("Não é possível agendar em um horário no passado", 400);
    }

    const foundPatient = await this.userRepository.findByIdPatient(data.patientId);
    const foundDoc = await this.userRepository.findById(data.docId);

    if (!foundPatient) {
      throw new AppError("Paciente não encontrado", 404);
    }
    if (!foundDoc) {
      throw new AppError("Médico não encontrado", 404);
    }

    // 🔒 Valida se médico tem exceção cadastrada para este dia
    const excecao = await this.agendaRepository.findExcecaoByDocEData(
      data.docId,
      horarioNorm
    );

    if (excecao) {
      throw new AppError(
        `Médico não atendimento nesta data${excecao.motivo ? `: ${excecao.motivo}` : ""}`,
        400
      );
    }

    // 🔒 Valida se paciente e médico são a mesma pessoa (mesmo CPF)
    if (foundPatient.cpf === foundDoc.cpf) {
      throw new AppError(
        "Um profissional não pode agendar consulta consigo mesmo",
        400
      );
    }

    // 🔒 Valida se já existe agendamento ativo no mesmo slot (horário específico)
    const agendamentosNoDia = await this.agendaRepository.findAgendamentosByDocEData(
      data.docId,
      horarioNorm
    );

    const horarioNovo = `${String(horarioNorm.getUTCHours()).padStart(2, "0")}:${String(horarioNorm.getUTCMinutes()).padStart(2, "0")}`;
    const horariosOcupados = agendamentosNoDia.map((agenda) => {
      const dataAgenda = new Date(agenda.horario_atend);
      const hours = dataAgenda.getUTCHours();
      const minutes = dataAgenda.getUTCMinutes();
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    });

    if (horariosOcupados.includes(horarioNovo)) {
      throw new AppError(
        "Já existe um agendamento neste horário para este profissional",
        409
      );
    }

    // 🔒 Valida se o paciente já tem agendamento neste horário (com outro médico)
    const agendamentosPaciente = await this.agendaRepository.findAgendamentosByPatientEHorario(
      data.patientId,
      horarioNorm
    );

    const horariosPaciente = agendamentosPaciente.map((agenda) => {
      const dataAgenda = new Date(agenda.horario_atend);
      const hours = dataAgenda.getUTCHours();
      const minutes = dataAgenda.getUTCMinutes();
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    });

    if (horariosPaciente.includes(horarioNovo)) {
      throw new AppError(
        "Você já possui um agendamento neste horário",
        409
      );
    }

    const agendaCreated = await this.agendaRepository.createAgenda({
      horario_atend: horarioNorm,
      duracaoMin: data.duracaoMin ?? 30,
      statusUrgencia: data.statusUrgencia ?? StatusUrgencia.BAIXO,
      status: data.status ?? StatusAtendimento.AGENDADO,
      tipo: data.tipo ?? TipoAtendimento.CONSULTA,
      patientId: data.patientId,
      docId: data.docId,
      createdById: data.createdById,
      cancelReason: data.cancelReason ?? undefined,
      motivo: data.motivo ?? undefined,
      observacoes: data.observacoes ?? undefined,
    });

    if (!agendaCreated) {
      throw new AppError("Ocorreu algum erro na criação da agenda", 500);
    }

    return agendaCreated;
  }

  // ============================================
  // MEUS AGENDAMENTOS (médico logado)
  // ============================================
  async listarMeusAgendamentos(params: {
    docId: string;
    busca?: string;
    periodo?: "hoje" | "posteriores" | "passados" | "todos";
    status?: StatusAtendimento;
    page?: number;
    limit?: number;
  }): Promise<PaginatedAgendamentos> {
    const page = params.page && params.page > 0 ? params.page : 1;
    const limit = params.limit && params.limit > 0 ? params.limit : 20;

    const { agendamentos, total } = await this.agendaRepository.findMeusAgendamentos({
      ...params,
      page,
      limit,
    });

    return {
      agendamentos,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  // ============================================
  // FINALIZAR
  // ============================================
  async marcarComoFinalizado(id: string, docId: string): Promise<UpdatedAgenda> {
    const agendamento = await this.agendaRepository.findById(id);

    if (!agendamento) {
      throw new AppError("Agendamento não encontrado", 404);
    }

    if (agendamento.docId !== docId) {
      throw new AppError("Este agendamento não pertence a você", 403);
    }

    if (agendamento.status === "FINALIZADO") {
      throw new AppError("Agendamento já está finalizado", 400);
    }

    if (agendamento.status === "CANCELADO") {
      throw new AppError("Não é possível finalizar um agendamento cancelado", 400);
    }

    return this.agendaRepository.updateStatus(id, "FINALIZADO");
  }

  // ============================================
  // CANCELAR
  // ============================================
  async cancelarAgendamento(id: string, docId: string, userId: string, motivo?: string): Promise<UpdatedAgenda> {
    const agendamento = await this.agendaRepository.findById(id);

    if (!agendamento) {
      throw new AppError("Agendamento não encontrado", 404);
    }

    if (agendamento.status === "CANCELADO") {
      throw new AppError("Agendamento já está cancelado", 400);
    }

    if (agendamento.status === "FINALIZADO") {
      throw new AppError("Não é possível cancelar um agendamento finalizado", 400);
    }

    return this.agendaRepository.updateStatus(id, "CANCELADO", motivo, userId);
  }

  // ============================================
  // RESTAURAR
  // ============================================
  async restaurarAgendamento(id: string, docId: string): Promise<RestoredAgenda> {
    const agendamento = await this.agendaRepository.findById(id);

    if (!agendamento) {
      throw new AppError("Agendamento não encontrado", 404);
    }

    if (agendamento.status !== "CANCELADO") {
      throw new AppError("Apenas agendamentos cancelados podem ser restaurados", 400);
    }

    return this.agendaRepository.restoreStatus(id);
  }

  // ============================================
  // EXCLUIR AGENDAMENTO
  // ============================================
  async excluirAgendamento(id: string): Promise<DeletedAgenda> {
    const agendamento = await this.agendaRepository.findById(id);

    if (!agendamento) {
      throw new AppError("Agendamento não encontrado", 404);
    }

    return this.agendaRepository.deleteAgenda(id);
  }

}