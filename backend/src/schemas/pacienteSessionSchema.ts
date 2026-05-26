import { z } from "zod";

export const pacienteSessionSchema = z.object({
  cpf: z
    .string()
    .trim()
    .regex(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/, "CPF inválido. Use o formato 000.000.000-00")
    .transform((v) => v.replace(/\D/g, "")),

  nascimento: z
    .string()
    .trim()
    .refine((v) => !isNaN(new Date(v).getTime()), { message: "Data de nascimento inválida" })
    .transform((v) => new Date(v)),
});

export type PacienteSessionInput = z.infer<typeof pacienteSessionSchema>;

