import UserRepository from "../repositories/UserRepository.js";
import { StatusAtendimento, StatusUrgencia, TipoAtendimento } from "../../generated/prisma/index.js";
import { Prisma } from "../../generated/prisma/index.js";
import { AppError } from "../errors/AppError.js";
import { Sexo } from "../../generated/prisma/index.js";
import bcrypt from "bcryptjs";

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

  async getProfissionais(params: {
    busca?: string;
    role?: string;
    page?: number;
  }) {
    const { busca, role, page = 1 } = params;
    const where: any = {
      role: { not: "ADMIN" } // não lista admins
    };

    if (role && role !== "TODOS") {
      where.role = role;
    }

    if (busca) {
      const termo = busca.trim();
      const numValue = termo.replace(/\D/g, "");
      where.OR = [
        { nome: { contains: termo, mode: "insensitive" } },
        ...(numValue.length === 11 ? [{ cpf: numValue }] : []),
      ];
    }

    return this.userRepo.findProfissionais(where, page);
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

  async getAgendamentos(params: {
    busca?: string;
    docId?: string;
    status?: string;
    statusUrgencia?: string;
    data?: string;
    page?: number;
  }) {
    const { busca, docId, status, statusUrgencia, data, page = 1 } = params;
    const where: any = {};

    if (docId) {
      where.docId = docId;
    }

    if (status && status !== "TODOS") {
      where.status = status;
    }

    if (statusUrgencia && statusUrgencia !== "TODOS") {
      where.statusUrgencia = statusUrgencia;
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

      where.paciente = {
        OR: [
          { nome: { contains: termo, mode: "insensitive" } },
          ...(numValue.length === 11 ? [{ cpf: numValue }] : []),
        ]
      };
    }

    return this.userRepo.findAgendamentos(where, page);
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

    if (!foundPatient) {
      throw new AppError("Paciente não encontrado", 404)
    }
    if (!foundDoc) {
      throw new AppError("Médico não encontrado", 404)
    }

    const agendaCreated = await this.userRepo.createAgenda({
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
    })

    if (!agendaCreated) {
      throw new AppError("Ocorreu algum erro na criação da agenda", 500)
    }

    return agendaCreated
  }

  async updateUser(id: string, data: {
    nome?: string;
    email?: string;
    password?: string;
    nascimento?: Date | string;
    fone?: string;
    avatar?: string;
    especialidade?: string;
    setor?: string;
  }) {
    const user = await this.userRepo.findById(id);

    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    const foneNormalized = data.fone ? data.fone.replace(/\D/g, "") : undefined;
    const nascimento = data.nascimento ? new Date(data.nascimento) : undefined;
    let password = undefined;

    if (data.password) {
      password = await bcrypt.hash(data.password, 10);
    }

    return this.userRepo.updateUser(id, {
      ...data,
      ...(foneNormalized && { fone: foneNormalized }),
      nascimento: data.nascimento ? new Date(data.nascimento) : undefined,
      ...(password && { password }),
    });
  }

  async deleteUser(id: string) {
    const user = await this.userRepo.findById(id);

    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    return this.userRepo.deleteUser(id);
  }

}