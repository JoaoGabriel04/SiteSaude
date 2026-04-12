import { z } from "zod";
import * as cpfValidator from "cpf-cnpj-validator";

function validationCPF(value: string) {
  const cpfNormalized = value.replace(/\D/g, "");

  if (process.env.NODE_ENV !== "production" && cpfNormalized.startsWith("999")) {
    return true;
  }

  return cpfValidator.cpf.isValid(cpfNormalized);
}

function validarCNS(value: string) {
  const cnsNormalized = value.replace(/\D/g, "");

  if (process.env.NODE_ENV !== "production" && cnsNormalized.startsWith("999")) {
    return true;
  }

  if (!/^[1-2]\d{10}00[0-1]\d$|^[7-9]\d{14}$/.test(cnsNormalized)) {
    return false;
  }

  let soma = 0;
  for (let i = 0; i < cnsNormalized.length; i++) {
    soma += Number(cnsNormalized[i]) * (15 - i);
  }

  return soma % 11 === 0;
}

export const regFormPatient = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres").max(100, "Nome deve ter no máximo 100 caracteres"),

  cpf: z.string()
    .transform((v) => v.replace(/\D/g, ""))
    .refine(validationCPF, {
      message: "CPF inválido",
    }),

  cartaoSus: z.string()
    .transform((v) => v.replace(/\D/g, ""))
    .refine(validarCNS, {
      message: "Cartão do SUS inválido",
    }),

  nascimento: z.coerce.date().refine(
    (date) => date <= new Date(),
    { message: "Data de nascimento inválida" }
  ),
  email: z.email("Email inválido").optional(),

  fone: z.string()
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => v.length === 10 || v.length === 11, {
      message: "Telefone inválido",
    })
});



export type RegisterFormPatient = z.input<typeof regFormPatient>