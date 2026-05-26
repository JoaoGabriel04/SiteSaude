import jwt from "jsonwebtoken";
import { AppError } from "../errors/AppError.js";
import { PacienteRepository } from "../repositories/paciente.repository.js";

export class PacientePortalService {
  private pacienteRepository = new PacienteRepository();

  async createSession(params: { cpf: string; nascimento: Date }): Promise<{ token: string }> {
    const secret = process.env.PATIENT_SESSION_SECRET;
    if (!secret) {
      throw new AppError("PATIENT_SESSION_SECRET not found", 500);
    }

    const paciente = await this.pacienteRepository.findByCpf(params.cpf);
    if (!paciente || !paciente.nascimento) {
      throw new AppError("Dados não conferem", 404);
    }

    const expected = new Date(paciente.nascimento).toISOString().slice(0, 10);
    const provided = new Date(params.nascimento).toISOString().slice(0, 10);
    if (expected !== provided) {
      throw new AppError("Dados não conferem", 404);
    }

    const token = jwt.sign({}, secret, {
      subject: paciente.id,
      expiresIn: "15m",
      audience: "paciente-portal",
      issuer: "sitesaude-backend",
    });

    return { token };
  }

  async getConsultas(patientId: string) {
    const paciente = await this.pacienteRepository.findById(patientId);
    if (!paciente) {
      throw new AppError("Sessão inválida", 401);
    }
    return paciente;
  }
}

