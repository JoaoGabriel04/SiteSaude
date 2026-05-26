import { DashboardRepository } from "../repositories/dashboard.repository.js";
import { Role } from "../../generated/prisma/index.js";

type GeneralStats = Awaited<ReturnType<DashboardRepository["getGeneralStats"]>>;
type MedicoStats = Awaited<ReturnType<DashboardRepository["getMedicoStats"]>>;
type AgendamentoHojeItem = Awaited<ReturnType<DashboardRepository["getAgendamentosHoje"]>>;
type MedicoDisponivelItem = Awaited<ReturnType<DashboardRepository["getMedicosDisponiveisHoje"]>>;

type DashboardStats = {
  role: Role;
  general: GeneralStats;
  medicoStats: MedicoStats | null;
  agendamentosHoje: AgendamentoHojeItem;
  medicosHoje: MedicoDisponivelItem;
};

export class DashboardService {
  constructor(private repo = new DashboardRepository()) {}

  async getStats(userId: string, role: Role): Promise<DashboardStats> {
    const isMedico = role === Role.MEDICO ? true : false;
    const isAdmin = role === Role.ADMIN ? true : false;

    const [general, medicoStats, agendamentosHoje, medicosHoje] = await Promise.all([
      this.repo.getGeneralStats(),
      isMedico ? this.repo.getMedicoStats(userId) : Promise.resolve(null),
      this.repo.getAgendamentosHoje(isMedico ? userId : undefined),
      this.repo.getMedicosDisponiveisHoje(),
    ]);

    return {
      role,
      general,
      medicoStats,
      agendamentosHoje,
      medicosHoje,
    };
  }
}