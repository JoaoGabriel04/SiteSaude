import { AppError } from "../errors/AppError.js";
import MedicoRepository from "../repositories/MedicoRepository.js";
import SolicitacaoRepository from "../repositories/SolicitacaoRepository.js";
import AgendaRepository from "../repositories/AgendaRepository.js";
import NotificacaoRepository from "../repositories/NotificacaoRepository.js";
import { NotificacaoService } from "./NotificacaoService.js";

export class MedicoService {
  private solicitacaoRepo: SolicitacaoRepository;
  
  constructor(
    private medicoRepo: MedicoRepository,
    private agendaRepo: AgendaRepository,
    private notificacaoService?: NotificacaoService
  ) {
    if (!notificacaoService) {
      const notificacaoRepo = new NotificacaoRepository();
      this.notificacaoService = new NotificacaoService(notificacaoRepo);
    }
    this.solicitacaoRepo = new SolicitacaoRepository();
  }

  async cadastrarDisponibilidade(data: {
    docId: string;
    diaSemana: number;
    horaInicio: string;
    horaFim: string;
    almocoInicio?: string;
    almocoFim?: string;
  }) {
    if (data.diaSemana < 0 || data.diaSemana > 6) {
      throw new AppError("Dia da semana inválido", 400);
    }

    const horaRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!horaRegex.test(data.horaInicio) || !horaRegex.test(data.horaFim)) {
      throw new AppError("Formato de hora inválido", 400);
    }

    if (data.horaInicio >= data.horaFim) {
      throw new AppError("Hora de início deve ser menor que hora de fim", 400);
    }

    const result = await this.medicoRepo.createDisponibilidade(data);
    return result;
  }

  async buscarDisponibilidade(docId: string) {
    return this.medicoRepo.findDisponibilidadeByDoc(docId);
  }

  async deletarDisponibilidade(id: string) {
    return this.medicoRepo.deleteDisponibilidade(id);
  }

  async buscarSlotsDisponiveis(docId: string, data: Date, patientId?: string) {
    const diaSemana = data.getUTCDay();

    const excecao = await this.agendaRepo.findExcecaoByDocEData(docId, data);
    if (excecao) {
      throw new AppError(`Médico não disponível nesse dia${excecao.motivo ? `: ${excecao.motivo}` : ""}`, 404);
    }

    const solicitacaoExcecao = await this.agendaRepo.findSolicitacaoAusenciaByData(docId, data);
    if (solicitacaoExcecao) {
      throw new AppError(`Médico não disponível nesse dia: ${solicitacaoExcecao.motivo || "Ausência"}`, 404);
    }

    const disponibilidade = await this.medicoRepo.findDisponibilidadeByDia(docId, diaSemana);
    if (!disponibilidade) {
      throw new AppError("Médico não atende nesse dia", 404);
    }

    const slots: string[] = [];
    const [horaIni, minIni] = disponibilidade.horaInicio.split(":").map(Number);
    const [horaFim, minFim] = disponibilidade.horaFim.split(":").map(Number);

    let atual = horaIni * 60 + minIni;
    const fim = horaFim * 60 + minFim;

    while (atual < fim) {
      const h = String(Math.floor(atual / 60)).padStart(2, "0");
      const m = String(atual % 60).padStart(2, "0");
      slots.push(`${h}:${m}`);
      atual += 30;
    }

    const agendamentos = await this.agendaRepo.findAgendamentosByDocEData(docId, data);
    const horariosOcupadosMedico = agendamentos.map((a) => {
      const d = new Date(a.horario_atend);
      const hours = d.getUTCHours();
      const minutes = d.getUTCMinutes();
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    });

    // Busca horários que o paciente já tem com outros médicos
    let horariosOcupadosPaciente: string[] = [];
    if (patientId) {
      const agendamentosPaciente = await this.agendaRepo.findAgendamentosByPatientEHorario(patientId, data);
      horariosOcupadosPaciente = agendamentosPaciente.map((a) => {
        const d = new Date(a.horario_atend);
        const hours = d.getUTCHours();
        const minutes = d.getUTCMinutes();
        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
      });
    }

    const todosHorariosOcupados = [...horariosOcupadosMedico, ...horariosOcupadosPaciente];

    const slotsDisponiveis = slots.filter((slot) => {
      if (todosHorariosOcupados.includes(slot)) return false;

      if (disponibilidade.almocoInicio && disponibilidade.almocoFim) {
        if (slot >= disponibilidade.almocoInicio && slot < disponibilidade.almocoFim) return false;
      }

      return true;
    });

return {
      disponibilidade,
      slots: slotsDisponiveis,
      ocupados: todosHorariosOcupados
    };
  }

  async cadastrarExcecao(data: {
    docId: string;
    data: Date;
    motivo?: string;
  }) {
    const excecaoExiste = await this.medicoRepo.findExcecaoByDocEData(data.docId, data.data);
    if (excecaoExiste) {
      throw new AppError("Já existe uma exceção cadastrada para esse dia", 400);
    }

    return this.medicoRepo.createExcecao(data);
  }

  async buscarExcecoes(docId: string) {
    const excecoesMedico = await this.medicoRepo.findExcecoesAprovadasByDoc(docId);
    const solicitacoesAusencia = await this.solicitacaoRepo.findApprovedByDocId(docId);
    
    const excecoesFormatadas = excecoesMedico.map(e => ({
      id: e.id,
      data: e.data,
      motivo: e.motivo,
      tipo: "unico" as const
    }));

    const solicitacoesFormatadas = solicitacoesAusencia.flatMap(s => 
      s.dias.map(d => ({
        id: d.id,
        solicitacaoId: s.id,
        data: d.data,
        motivo: s.motivo,
        tipo: "periodo" as const
      }))
    );

    return [...excecoesFormatadas, ...solicitacoesFormatadas];
  }

  async deletarExcecao(id: string, userId?: string) {
    const solic = await this.solicitacaoRepo.findById(id);
    if (solic) {
      return this.solicitacaoRepo.delete(id);
    }

    const excecao = await this.medicoRepo.findSolicitacaoById(id);
    if (excecao) {
      return this.medicoRepo.deleteExcecao(id);
    }

    const solicPorDoc = await this.solicitacaoRepo.findApprovedByDocId(userId || "");
    for (const s of solicPorDoc) {
      if (s.dias.some(d => d.id === id)) {
        if (s.dias.length === 1) {
          return this.solicitacaoRepo.delete(s.id);
        }
        const { Prisma } = await import("../../generated/prisma/index.js");
        const prisma = (await import("../lib/prisma.js")).prisma;
        return prisma.solicitacaoAusenciaDia.delete({ where: { id } });
      }
    }

    throw new AppError("Exceção não encontrada", 404);
  }

  async cadastrarExcecaoPeriodo(data: {
    docId: string;
    dataInicio: Date;
    dataFim: Date;
    motivo?: string;
  }) {
    const datas: Date[] = [];
    const atual = new Date(data.dataInicio);
    const fim = new Date(data.dataFim);

    while (atual <= fim) {
      datas.push(new Date(atual));
      atual.setDate(atual.getDate() + 1);
    }

    if (datas.length === 0) {
      throw new AppError("Data início deve ser anterior ou igual à data fim", 400);
    }

    const hasConflict = await this.solicitacaoRepo.hasPendingConflict(data.docId, datas);
    if (hasConflict) {
      throw new AppError("Já existe uma solicitação pendente para uma das datas selecionadas", 400);
    }

    const result = await this.solicitacaoRepo.create({
      docId: data.docId,
      motivo: data.motivo,
      datas
    });

    return { id: result.id, count: datas.length };
  }

  async buscarMinhasSolicitacoes(docId: string) {
    const solicOld = await this.medicoRepo.findMinhasSolicitacoes(docId);
    const solicNew = await this.solicitacaoRepo.findByDocId(docId);

    const oldFormatted = solicOld.map(s => ({
      id: s.id,
      docId: s.docId,
      data: s.data,
      motivo: s.motivo,
      status: s.status,
      observacaoAdmin: s.observacaoAdmin,
      dataSolicitacao: s.dataSolicitacao,
      dataResposta: s.dataResposta,
      aprovadoPor: s.aprovadoPor,
      tipo: "unico" as const
    }));

    const newFormatted = solicNew.map(s => ({
      id: s.id,
      docId: s.docId,
      data: s.dias[0]?.data,
      dataFim: s.dias[s.dias.length - 1]?.data,
      motivo: s.motivo,
      status: s.status,
      observacaoAdmin: s.observacaoAdmin,
      dataSolicitacao: s.dataSolicitacao,
      dataResposta: s.dataResposta,
      aprovadoPor: s.aprovadoPor,
      tipo: "periodo" as const,
      totalDias: s.dias.length
    }));

    return [...oldFormatted, ...newFormatted];
  }

  /* =======================
     SOLICITAÇÕES
  ======================= */

  async buscarSolicitacoesPendentes() {
    const solicOld = await this.medicoRepo.findSolicitacoesPendentes();
    const solicNew = await this.solicitacaoRepo.findPendentes();

    const oldFormatted = solicOld.map(s => ({
      id: s.id,
      docId: s.docId,
      data: s.data,
      motivo: s.motivo,
      status: s.status,
      dataSolicitacao: s.dataSolicitacao,
      medico: s.medico,
      tipo: "unico" as const
    }));

    const newFormatted = solicNew.map(s => ({
      id: s.id,
      docId: s.docId,
      data: s.dias[0]?.data,
      dataFim: s.dias[s.dias.length - 1]?.data,
      motivo: s.motivo,
      status: s.status,
      dataSolicitacao: s.dataSolicitacao,
      medico: s.medico,
      dias: s.dias,
      tipo: "periodo" as const,
      totalDias: s.dias.length
    }));

    return [...oldFormatted, ...newFormatted];
  }

  async buscarSolicitacaoById(id: string) {
    const solicNew = await this.solicitacaoRepo.findById(id);
    if (solicNew) {
      return {
        ...solicNew,
        data: solicNew.dias[0]?.data,
        dataFim: solicNew.dias[solicNew.dias.length - 1]?.data,
        totalDias: solicNew.dias.length
      };
    }
    return this.medicoRepo.findSolicitacaoById(id);
  }

  async aprovarSolicitacao(id: string, aprovadoPorId: string) {
    const solicNew = await this.solicitacaoRepo.findById(id);
    if (solicNew) {
      if (solicNew.status !== "PENDENTE") {
        throw new AppError("Esta solicitação já foi processada", 400);
      }

      await this.solicitacaoRepo.approve(id, aprovadoPorId);

      const dataInicio = new Date(solicNew.dias[0].data).toLocaleDateString("pt-BR");
      const dataFim = new Date(solicNew.dias[solicNew.dias.length - 1].data).toLocaleDateString("pt-BR");

      if (solicNew.medico?.user) {
        await this.notificacaoService!.notificarSolicitacaoAprovada(
          solicNew.medico.user.id,
          solicNew.medico.user.email,
          solicNew.medico.user.nome,
          solicNew.motivo || "Ausência",
          dataInicio,
          dataFim
        );
      }

      return { message: "Solicitação aprovada com sucesso" };
    }

    const solicitacao = await this.medicoRepo.findSolicitacaoById(id);
    if (!solicitacao) {
      throw new AppError("Solicitação não encontrada", 404);
    }
    if (solicitacao.status !== "PENDENTE") {
      throw new AppError("Esta solicitação já foi processada", 400);
    }

    await this.medicoRepo.aprovarSolicitacao(id, aprovadoPorId);

    const medico = solicitacao.medico as any;
    if (medico?.user) {
      const dataInicio = new Date(solicitacao.data).toLocaleDateString("pt-BR");
      const dataFim = new Date(solicitacao.data).toLocaleDateString("pt-BR");
      
      await this.notificacaoService!.notificarSolicitacaoAprovada(
        medico.user.id,
        medico.user.email,
        medico.user.nome,
        solicitacao.motivo || "Ausência",
        dataInicio,
        dataFim
      );
    }

    return { message: "Solicitação aprovada com sucesso" };
  }

  async negarSolicitacao(id: string, aprovadoPorId: string, observacao: string) {
    const solicNew = await this.solicitacaoRepo.findById(id);
    if (solicNew) {
      if (solicNew.status !== "PENDENTE") {
        throw new AppError("Esta solicitação já foi processada", 400);
      }

      await this.solicitacaoRepo.deny(id, aprovadoPorId, observacao);

      const dataInicio = new Date(solicNew.dias[0].data).toLocaleDateString("pt-BR");
      const dataFim = new Date(solicNew.dias[solicNew.dias.length - 1].data).toLocaleDateString("pt-BR");

      if (solicNew.medico?.user) {
        await this.notificacaoService!.notificarSolicitacaoNegada(
          solicNew.medico.user.id,
          solicNew.medico.user.email,
          solicNew.medico.user.nome,
          solicNew.motivo || "Ausência",
          dataInicio,
          dataFim,
          observacao
        );
      }

      return { message: "Solicitação negada com sucesso" };
    }

    const solicitacao = await this.medicoRepo.findSolicitacaoById(id);
    if (!solicitacao) {
      throw new AppError("Solicitação não encontrada", 404);
    }
    if (solicitacao.status !== "PENDENTE") {
      throw new AppError("Esta solicitação já foi processada", 400);
    }

    await this.medicoRepo.negarSolicitacao(id, aprovadoPorId, observacao);

    const medico = solicitacao.medico as any;
    if (medico?.user) {
      const dataInicio = new Date(solicitacao.data).toLocaleDateString("pt-BR");
      const dataFim = new Date(solicitacao.data).toLocaleDateString("pt-BR");
      
      await this.notificacaoService!.notificarSolicitacaoNegada(
        medico.user.id,
        medico.user.email,
        medico.user.nome,
        solicitacao.motivo || "Ausência",
        dataInicio,
        dataFim,
        observacao
      );
    }

    return { message: "Solicitação negada com sucesso" };
  }
}