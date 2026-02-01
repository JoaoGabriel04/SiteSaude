import { prisma } from "../lib/prisma.js";
import { Role } from "../../generated/prisma/index.js";

export default class UserRepository {
  /* =======================
     USER + MÉDICO
  ======================= */

  async createDoctor(data: {
    nome: string;
    email: string;
    cpf: string;
    nascimento: Date;
    fone: string;
    password: string;
    role: Role;
    crm?: string;
    especialidade?: string;
  }) {
    return prisma.user.create({
      data: {
        nome: data.nome,
        email: data.email,
        cpf: data.cpf,
        nascimento: data.nascimento,
        fone: data.fone,
        password: data.password,
        role: data.role,

        medico: {
          create: {
            crm: data.crm!,
            especialidade: data.especialidade!,
          },
        },
      },
      include: {
        medico: true,
      },
    });
  }

  /* =======================
     USER + ATENDENTE
  ======================= */

  async createAttend(data: {
    nome: string;
    email: string;
    cpf: string;
    nascimento: Date;
    fone: string;
    password: string;
    role: Role;
    setor?: string;
  }) {
    return prisma.user.create({
      data: {
        nome: data.nome,
        email: data.email,
        cpf: data.cpf,
        nascimento: data.nascimento,
        fone: data.fone,
        password: data.password,
        role: data.role,

        atendente: {
          create: {
            setor: data.setor!,
          },
        },
      },
      include: {
        atendente: true,
      },
    });
  }

  /* =======================
     QUERIES
  ======================= */

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        medico: true,
        atendente: true,
      },
    });
  }

  async findById(id: string) {
    return prisma.user.findFirst({
      where: { id },
      include: {
        medico: true,
        atendente: true,
      },
    });
  }

  async updateByEmail(email: string, data: any) {
    return prisma.user.update({
      where: { email },
      data,
    });
  }
}