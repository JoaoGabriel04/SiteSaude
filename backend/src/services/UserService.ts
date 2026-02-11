import UserRepository from "../repositories/UserRepository.js";
import { regPant } from "../api/middlewares/validate.js";
import { StatusAtendimento, StatusUrgencia, TipoAtendimento } from "../../generated/prisma/index.js";
import { Prisma } from "../../generated/prisma/index.js";

export class UserService {
  constructor(private userRepo: UserRepository) { }

  async getUserById(id: string) {
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  async registerPatient(data: {
    nome: string,
    cpf: string,
    nascimento: Date,
    fone: string,
    email?: string,
    cartaoSus: string
  }) {

    const { error } = regPant(data)
    if (error) {
      throw new Error(error.message)
    }

    const nascimentoDate = new Date(data.nascimento)
    const foneNormalized = data.fone.replace(/\D/g, "")

    const patientCreated = await this.userRepo.createPatient({
      nome: data.nome,
      cpf: data.cpf,
      nascimento: nascimentoDate,
      fone: foneNormalized,
      email: data.email,
      cartaoSus: data.cartaoSus
    });

    if (!patientCreated) {
      throw new Error("Algum erro ocorreu no registro de paciente");
    }
    return patientCreated

  }

  async registerAgenda(data: Prisma.AgendaUncheckedCreateInput) {

    const horarioNorm = new Date(data.horario_atend)

    const foundPatient = await this.userRepo.findByIdPatient(data.patientId)
    const foundDoc = await this.userRepo.findById(data.docId)
    const foundAttend = await this.userRepo.findById(data.createdById)

    if (!foundPatient) {
      throw new Error("Paciente não encontrado")
    }
    if (!foundDoc) {
      throw new Error("Medico não encontrado")
    }
    if(!foundAttend){
      throw new Error("Não autorizado")
    }

    const agendaCreated = await this.userRepo.createAgenda({
      horario_atend: horarioNorm,
      duracaoMin: data.duracaoMin ?? 15,
      statusUrgencia: data.statusUrgencia ?? StatusUrgencia.BAIXO,
      status: data.status ?? StatusAtendimento.CONFIRMADO,
      tipo: data.tipo ?? TipoAtendimento.CONSULTA,
      patientId: data.patientId,
      docId: data.docId,
      createdById: data.createdById,
      cancelReason: data.cancelReason ?? undefined,
      motivo: data.motivo ?? undefined,
      observacoes: data.observacoes ?? undefined,
    })

    if (!agendaCreated) {
      throw new Error("Ocorreu algum erro na criação da agenda")
    }

    return agendaCreated

  }

}