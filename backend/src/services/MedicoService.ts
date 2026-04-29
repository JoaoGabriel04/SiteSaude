import { AppError } from "../errors/AppError.js";
import MedicoRepository from "../repositories/MedicoRepository.js";

export class MedicoService {
  constructor(private medicoRepo: MedicoRepository) { }

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

  async buscarSlotsDisponiveis(docId: string, data: Date) {
    const diaSemana = data.getDay();

    // Verifica se há exceção nesse dia
    const excecao = await this.medicoRepo.findExcecaoByDocEData(docId, data);
    if (excecao) {
      throw new AppError(`Médico não disponível nesse dia${excecao.motivo ? `: ${excecao.motivo}` : ""}`, 404);
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

    const agendamentos = await this.medicoRepo.findAgendamentosByDocEData(docId, data);
    const horariosOcupados = agendamentos.map((a) => {
      const d = new Date(a.horario_atend);
      return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    });

    const slotsDisponiveis = slots.filter((slot) => {
      if (horariosOcupados.includes(slot)) return false;

      if (disponibilidade.almocoInicio && disponibilidade.almocoFim) {
        if (slot >= disponibilidade.almocoInicio && slot < disponibilidade.almocoFim) return false;
      }

      return true;
    });

    return {
      disponibilidade,
      slots: slotsDisponiveis,
      ocupados: horariosOcupados
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
    return this.medicoRepo.findExcecoesByDoc(docId);
  }

  async deletarExcecao(id: string) {
    return this.medicoRepo.deleteExcecao(id);
  }
}