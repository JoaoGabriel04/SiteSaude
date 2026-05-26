import { z } from "zod";
import { validationCPF, validarCNS } from "../utils/validaCpfCns.js";

export const registerPatient = z.object({
  nome: z.string().min(3).max(100),

  cpf: z
    .string()
    .refine((val) => {
      try { validationCPF(val); return true; } catch { return false; }
    }, "CPF inválido")
    .transform((val) => val.replace(/\D/g, "")),

  cartaoSus: z
    .string()
    .refine((val) => {
      try { validarCNS(val); return true; } catch { return false; }
    }, "Cartão do SUS inválido")
    .transform((val) => val.replace(/\D/g, "")),

  nascimento: z.string()
    .refine((v) => !isNaN(new Date(v).getTime()), { message: "Data de nascimento inválida" })
    .transform((v) => new Date(v).toISOString()),

  email: z.string().email().optional(),

  fone: z.string().regex(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/),
});
