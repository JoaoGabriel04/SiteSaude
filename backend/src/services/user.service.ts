import UserRepository from "../repositories/user.repository.js";
import { Sexo, Prisma } from "../../generated/prisma/index.js";
import { AppError } from "../errors/AppError.js";
import bcrypt from "bcryptjs";
import { UploadService } from "./upload.service.js";

export class UserService {
  constructor(private userRepo: UserRepository) {}

  async getAll() {
    const users = await this.userRepo.getAll();
    if (!users) {
      throw new AppError("No users found", 404);
    }
    return users;
  }

  async getUserById(id: string) {
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    return user;
  }

  async getProfissionais(params: {
    busca?: string;
    role?: string;
    page?: number;
  }) {
    const { busca, role, page = 1 } = params;
    const where: Prisma.UserWhereInput = {
      role: { not: "ADMIN" },
    };

    if (role && role !== "TODOS") {
      where.role = role as "MEDICO" | "ATENDENTE" | "ADMIN";
    }

    if (busca) {
      const termo = busca.trim();
      const numValue = termo.replace(/\D/g, "");
      where.OR = [
        { nome: { contains: termo, mode: "insensitive" } },
        ...(numValue.length >= 10 ? [
          { cpf: { contains: numValue } },
          { fone: { contains: numValue } },
        ] : []),
      ];
    }

    return this.userRepo.findProfissionais(where, page);
  }

  async getPacient(busca?: string, page = 1, sexo?: string) {
    const value = busca?.trim() || "";
    const numValue = value.replace(/\D/g, "");
    const filtros: Prisma.PatientWhereInput[] = [];

    if (value) {
      if (numValue) {
        filtros.push({
          OR: [
            { fone: { contains: numValue } },
            { cpf: { contains: numValue } },
            { cartaoSus: { contains: numValue } },
          ],
        });
      }

      if (value.includes("@")) {
        filtros.push({
          email: { contains: value, mode: "insensitive" },
        });
      }

      filtros.push({
        nome: { contains: value, mode: "insensitive" },
      });
    }

    const where: Prisma.PatientWhereInput = {};

    if (filtros.length) {
      where.OR = filtros;
    }

    if (sexo && sexo !== "TODOS") {
      where.sexo = sexo as "MASCULINO" | "FEMININO" | "OUTRO";
    }

    return this.userRepo.findPaciente(where, page);
  }

  async registerPatient(data: Prisma.PatientCreateInput) {
    const cpfExists = await this.userRepo.findByCpf(data.cpf);
    const cnsExists = await this.userRepo.findByCns(data.cartaoSus);

    if (cpfExists) {
      throw new AppError("CPF já cadastrado!", 400);
    }

    if (cnsExists) {
      throw new AppError("CNS já cadastrado!", 400);
    }

    const nascimentoDate = new Date(data.nascimento);
    const foneNormalized = data.fone.replace(/\D/g, "");

    try {
      const patientCreated = await this.userRepo.createPatient({
        nome: data.nome,
        cpf: data.cpf,
        nascimento: nascimentoDate,
        fone: foneNormalized,
        email: data.email ?? undefined,
        cartaoSus: data.cartaoSus,
        sexo: (data.sexo as Sexo) ?? Sexo.OUTRO,
      });

      if (!patientCreated) {
        throw new AppError("Algum erro ocorreu no registro de paciente", 500);
      }

      return patientCreated;
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new AppError("Registro duplicado", 400);
      }
      throw error;
    }
  }

  async updatePatient(
    id: string,
    data: {
      nome?: string;
      sexo?: Sexo;
      nascimento?: Date | string;
      fone?: string;
      email?: string;
    }
  ) {
    const patient = await this.userRepo.findByIdPatient(id);

    if (!patient) {
      throw new AppError("Paciente não encontrado", 404);
    }

    const foneNormalized = data.fone ? data.fone.replace(/\D/g, "") : undefined;

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

  async updateUser(
    id: string,
    data: {
      nome?: string;
      email?: string;
      password?: string;
      nascimento?: Date | string;
      fone?: string;
      avatar?: string;
      especialidade?: string;
      setor?: string;
    }
  ) {
    const user = await this.userRepo.findById(id);

    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    const foneNormalized = data.fone ? data.fone.replace(/\D/g, "") : undefined;
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

  async updateProfile(
    id: string,
    data: {
      nome?: string;
      email?: string;
      password?: string;
      avatar?: string;
      especialidade?: string;
    }
  ) {
    const user = await this.userRepo.findById(id);

    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    let password: string | undefined;
    if (data.password) {
      password = await bcrypt.hash(data.password, 10);
    }

    const updateData: {
      nome?: string;
      email?: string;
      password?: string;
      avatar?: string;
    } = {};

    if (data.nome) updateData.nome = data.nome;
    if (data.email) updateData.email = data.email;
    if (password) updateData.password = password;
    if (data.avatar !== undefined) updateData.avatar = data.avatar;

    await this.userRepo.updateUser(id, updateData);

    if (data.especialidade && user.medico) {
      await this.userRepo.updateMedico(user.id, { especialidade: data.especialidade });
    }

    return this.userRepo.findById(id);
  }

  async deleteUser(id: string) {
    const user = await this.userRepo.findById(id);

    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    if (user.avatar) {
      try {
        const uploadService = new UploadService();
        await uploadService.deleteAvatar(user.avatar);
      } catch {
        // ignora erro do Cloudinary
      }
    }

    try {
      return await this.userRepo.deleteUser(id);
    } catch (error) {
      console.error("Erro ao deletar usuário do banco:", error);
      throw error;
    }
  }
}