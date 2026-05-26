import { prisma } from '../lib/prisma.js';

export class PacienteRepository {
    
    async findByCpf(cpf: string) {
        return await prisma.patient.findFirst({
            where: { cpf },
            include: {
                agendas: {
                    include: {
                        medico: {
                            include: {
                                user: true   
                            }
                        }
                    },
                    orderBy: {
                        horario_atend: 'desc'
                    }
                }
            }
        });
    }

    async findById(id: string) {
        return await prisma.patient.findUnique({
            where: { id },
            include: {
                agendas: {
                    include: {
                        medico: {
                            include: {
                                user: true
                            }
                        }
                    },
                    orderBy: {
                        horario_atend: 'desc'
                    }
                }
            }
        });
    }
}