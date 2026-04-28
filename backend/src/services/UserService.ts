import UserRepository from "../repositories/UserRepository.js";
import { StatusAtendimento, StatusUrgencia, TipoAtendimento } from "../../generated/prisma/index.js";
import { Prisma } from "../../generated/prisma/index.js";
import { AppError } from "../errors/AppError.js";
import {Sexo} from "../../generated/prisma/index.js";

export class UserService {
  constructor(private userRepo: UserRepository) { }

  async getAll() {
    const users = await this.userRepo.getAll();
    if (!users) {
      throw new Error("No users found");
    }
    return users;
  }

  async getUserById(id: string) {
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  async getPacient(busca?: string, page = 1, sexo?: string) {

    const value = busca?.trim() || ''
    const numValue = value.replace(/\D/g, '')
    const filtros: any[] = []

    if (value) {

      if (numValue) {
        filtros.push({
          OR: [{
            fone: {
              contains: numValue,
            }
          },
          {
            cpf: {
              contains: numValue,
            }
          },
          {
            cartaoSus: {
              contains: numValue,
            }
          }]
        })
      }

      if (value.includes('@')) {
        filtros.push({
          email: {
            contains: value,
            mode: 'insensitive'
          }
        })
      }

      filtros.push({
        nome: {
          contains: value,
          mode: 'insensitive'
        }
      })
    }

    const where: any = {}

    if (filtros.length) {
      where.OR = filtros
    }

    if (sexo && sexo !== 'TODOS') {
      where.sexo = sexo
    }

    return this.userRepo.findPaciente(where, page)
  }

  async getAgendas(data: Prisma.$AgendaPayload) {
    return this.userRepo.findAgendas(data)
  }

  async registerPatient(data: Prisma.PatientCreateInput) {

    const cpfExists = await this.userRepo.findByCpf(data.cpf)
    const cnsExists = await this.userRepo.findByCns(data.cartaoSus)
  
    if (cpfExists) {
      throw new AppError("CPF já cadastrado!", 400)
    }
  
    if (cnsExists) {
      throw new AppError("CNS já cadastrado!", 400)
    }
  
    const nascimentoDate = new Date(data.nascimento)
    const foneNormalized = data.fone.replace(/\D/g, "")
  
    try {
      const patientCreated = await this.userRepo.createPatient({
        nome: data.nome,
        cpf: data.cpf,
        nascimento: nascimentoDate,
        fone: foneNormalized,
        email: data.email ?? undefined,
        cartaoSus: data.cartaoSus,
        sexo: data.sexo as Sexo ?? Sexo.OUTRO
      });
  
      if (!patientCreated) {
        throw new AppError("Algum erro ocorreu no registro de paciente", 500);
      }
  
      return patientCreated
  
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new AppError("Registro duplicado", 400)
      }
      throw error
    }
  }

  async updatePatient(id: string, data: {
    nome?: string;
    sexo?: Sexo;
    nascimento?: Date | string;
    fone?: string;
    email?: string;
  }) {
    const patient = await this.userRepo.findByIdPatient(id);

    if (!patient) {
      throw new AppError("Paciente não encontrado", 404);
    }

    const foneNormalized = data.fone
      ? data.fone.replace(/\D/g, "")
      : undefined;

    return this.userRepo.updatePatient(id, {
      ...data,
      ...(foneNormalized && { fone: foneNormalized }),
      nascimento: data.nascimento ? new Date(data.nascimento) : undefined,
    });
  }

  async deletePatient(id: string) {
    const patient = await this.userRepo.findByIdPatient(id);

    if (!patient) {
      throw new AppError("Paciente não encontrado", 404);
    }

    return this.userRepo.deletePatient(id);
  }

  async registerAgenda(data: Prisma.AgendaUncheckedCreateInput) {

    const horarioNorm = new Date(data.horario_atend)

    const foundPatient = await this.userRepo.findByIdPatient(data.patientId)
    const foundDoc = await this.userRepo.findById(data.docId)
    const foundAttend = await this.userRepo.findById(data.createdById)

    if (!foundPatient) {
      throw new AppError("Paciente não encontrado", 404)
    }
    if (!foundDoc) {
      throw new AppError("Médico não encontrado", 404)
    }
    if (!foundAttend) {
      throw new AppError("Não autorizado", 401)
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
      throw new AppError("Ocorreu algum erro na criação da agenda", 500)
    }

    return agendaCreated

  }

}