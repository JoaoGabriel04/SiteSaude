import { z } from "zod";
import { StatusUrgencia, TipoAtendimento } from "../../generated/prisma/index.js";

export const registerAgendamento = z.object({
  horario_atend: z.string().datetime({ offset: true }),

  duracaoMin: z.number().int().min(15).max(180).default(30),

  patientId: z.string().uuid(),

  docId: z.string().uuid(),

  tipo: z.nativeEnum(TipoAtendimento).default(TipoAtendimento.CONSULTA),

  statusUrgencia: z.nativeEnum(StatusUrgencia).default(StatusUrgencia.BAIXO),

  motivo: z.string().max(500).optional(),

  observacoes: z.string().max(1000).optional(),
});
