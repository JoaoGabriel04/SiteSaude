import { prisma } from "../lib/prisma.js";
import { Role, StatusAtendimento, StatusUrgencia, TipoAtendimento } from "../../generated/prisma/index.js";

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
    USER + PACIENTE
  ======================= */

  async createPatient(data: {
    nome: string,
    cpf: string,
    nascimento: Date,
    fone: string,
    email?: string,
    cartaoSus: string
  }) {
    return prisma.patient.create({
      data: {
        nome: data.nome,
        cpf: data.cpf,
        nascimento: data.nascimento,
        fone: data.fone,
        email: data.email,
        cartaoSus: data.cartaoSus
      }
    })
  }

  /* =======================
     USER + AGENDA
  ======================= */

  async createAgenda(
    data: {
      horario_atend: Date,
      duracaoMin: number,
      statusUrgencia: StatusUrgencia,
      status: StatusAtendimento,
      tipo: TipoAtendimento,
      patientId: string,
      docId: string,
      createdById: string,
      cancelReason?: string,
      motivo?: string,
      observacoes?: string
    }
  ) {
    return prisma.agenda.create({
      data: {
        horario_atend: data.horario_atend,
        duracaoMin: data.duracaoMin,
        statusUrgencia: data.statusUrgencia,
        status: data.status,
        tipo: data.tipo,
        cancelReason: data.cancelReason,
        motivo: data.motivo,
        observacoes: data.observacoes,

        paciente: {
          connect: { id: data.patientId }
        },

        medico: {
          connect: { userId: data.docId }
        },

        createdBy: {
          connect: { id: data.createdById }
        }
      }
    })
  }


  /* =======================
     QUERIES
  ======================= */

  async getAll() {
    return prisma.user.findMany({
      include: {
        medico: true,
        atendente: true,
      },
    });
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
    return prisma.user.findFirst({
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

  async updateByEmail(email: string, data: any) {
    return prisma.user.update({
      where: { email },
      data,
    });
  }

  async checkHour(docId: string) {
    return prisma.agenda.findFirst({
      where:{docId}
    })
  }

}