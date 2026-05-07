import { DashboardRepository } from "../repositories/DashboardRepository.js";
import { Role } from "../../generated/prisma/index.js";

export class DashboardService {
  constructor(private repo = new DashboardRepository()) {}

  async getStats(userId: string, role: Role) {
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