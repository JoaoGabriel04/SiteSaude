import { z } from "zod";

export const acessarConsultaSchema = z.object({
  nomeCompleto: z.string().trim().min(3).max(100).optional(),

  cpf: z
    .string()
    .trim()
    .regex(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/, "CPF inválido. Use o formato 000.000.000-00"),
});

export type AcessarConsultaInput = z.infer<typeof acessarConsultaSchema>;
