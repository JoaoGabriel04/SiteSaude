import { prisma } from "../lib/prisma.js";
import { Role, Sexo } from "../../generated/prisma/index.js";
import type { Prisma } from "../../generated/prisma/index.js";

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
    avatar?: string;
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
        avatar: data.avatar,

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
    avatar?: string;
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
        avatar: data.avatar,

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
    USER + PACIENTE
  ======================= */

  async createPatient(data: {
    nome: string,
    cpf: string,
    nascimento: Date,
    fone: string,
    email?: string,
    cartaoSus: string,
    sexo: Sexo
  }) {
    return prisma.patient.create({
      data: {
        nome: data.nome,
        cpf: data.cpf,
        nascimento: data.nascimento,
        fone: data.fone,
        email: data.email,
        cartaoSus: data.cartaoSus,
        sexo: data.sexo
      }
    })
  }

  /* =======================
     QUERIES
  ======================= */

  async getAll() {
    return prisma.user.findMany({
      select: {
        id: true,
        nome: true,
        cpf: true,
        nascimento: true,
        fone: true,
        email: true,
        avatar: true,
        role: true,
        createdAt: true,
        updatedAt: true,

        medico: {
          select: {
            crm: true,
            especialidade: true,
          },
        },

        atendente: {
          select: {
            setor: true,
          },
        },
      },
    });
  }

  async getAllPacients(page: number) {
    const limit = 12
    return prisma.patient.findMany({
      take: limit,
      skip: (page - 1) * limit,
      orderBy: {
        nome: 'asc'
      }
    })
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        medico: true,
        atendente: true,
      },
    });
  }

  async findByCpfUser(cpf: string) {
    return prisma.user.findUnique({
      where: { cpf }
    })
  }

  async findByCrm(crm: string) {
    return prisma.doctor.findFirst({
      where: { crm }
    })
  }

  async findProfissionais(where: Prisma.UserWhereInput, page: number) {
    const limit = 12;

    return prisma.user.findMany({
      where,
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { nome: 'asc' },
      select: {
        id: true,
        nome: true,
        cpf: true,
        nascimento: true,
        fone: true,
        email: true,
        avatar: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        medico: {
          select: {
            userId: true,
            crm: true,
            especialidade: true,
            status: true,
          }
        },
        atendente: true,
      }
    });
  }

  async findPaciente(where: Prisma.PatientWhereInput, page: number) {

    const limit = 12

    return prisma.patient.findMany({
      where,
      take: limit,
      skip: (page - 1) * limit,
      orderBy: {
        nome: 'asc'
      },
    })

  }

  async findByCpf(cpf: string) {
    return await prisma.patient.findFirst({
      where: { cpf }
    })
  }

  async findByCns(cartaoSus: string) {
    return await prisma.patient.findFirst({
      where: { cartaoSus }
    })
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        medico: true,
        atendente: true,
      },
    });
  }

  async findByIdPatient(id: string) {
    return prisma.patient.findFirst({
      where: {
        id
      }
    })
  }

  async updateByEmail(email: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({
      where: { email },
      data,
    });
  }

  async updatePatient(id: string, data: {
    nome?: string;
    sexo?: Sexo;
    nascimento?: Date;
    fone?: string;
    email?: string;
  }) {
    return prisma.patient.update({
      where: { id },
      data
    });
  }

  async deletePatient(id: string) {
    return prisma.patient.delete({
      where: { id }
    });
  }

  async updateUser(id: string, data: {
    nome?: string;
    email?: string;
    password?: string;
    nascimento?: Date;
    fone?: string;
    avatar?: string;
    especialidade?: string;
    setor?: string;
  }) {
    const { especialidade, setor, ...userData } = data;

    return prisma.user.update({
      where: { id },
      data: {
        ...userData,
        ...(especialidade && {
          medico: { update: { especialidade } }
        }),
        ...(setor && {
          atendente: { update: { setor } }
        }),
      },
      include: {
        medico: true,
        atendente: true,
      }
    });
  }

  async updateMedico(userId: string, data: { especialidade?: string }) {
    return prisma.doctor.update({
      where: { userId },
      data: {
        ...(data.especialidade && { especialidade: data.especialidade }),
      },
      include: {
        user: true,
      }
    });
  }

  async deleteUser(id: string) {
    return prisma.$transaction(async (tx) => {
      // Deleta agendamentos do médico
      await tx.agenda.deleteMany({ where: { docId: id } });
      // Deleta agendamentos criados pelo usuário
      await tx.agenda.deleteMany({ where: { createdById: id } });
      // Deleta disponibilidades e exceções
      await tx.disponibilidade.deleteMany({ where: { docId: id } });
      await tx.excecaoMedico.deleteMany({ where: { docId: id } });
      // Deleta relações de médico/atendente
      await tx.doctor.deleteMany({ where: { userId: id } });
      await tx.attend.deleteMany({ where: { userId: id } });
      // Deleta o usuário
      await tx.user.delete({ where: { id } });
    });
  }
}