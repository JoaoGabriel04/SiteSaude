import { z } from "zod";
import * as cpfValidator from "cpf-cnpj-validator";

function validationCPF(value: string) {
  const cpfNormalized = value.replace(/\D/g, "");

  if (process.env.NODE_ENV !== "production" && cpfNormalized.startsWith("999")) {
    return true;
  }

  return cpfValidator.cpf.isValid(cpfNormalized);
}

export const regFormMedico = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres").max(100, "Nome deve ter no máximo 100 caracteres"),

  email: z.email("Email inválido"),
  password: z.string()
  .min(8, "A senha deve ter no mínimo 8 caracteres")
  .max(30, "A senha deve ter no máximo 30 caracteres")
  .regex(
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,30}$/,
    "A senha deve ter letras maiúsculas, minúsculas, número e caractere especial"
  ),
  confirmPassword: z.string().min(1, "Confirme sua senha"),

  nascimento: z.coerce.date().refine(
    (date) => date <= new Date(),
    { message: "Data de nascimento inválida" }
  ),

  fone: z.string()
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => v.length === 10 || v.length === 11, {
      message: "Telefone inválido",
    }),

  cpf: z.string()
    .transform((v) => v.replace(/\D/g, ""))
    .refine(validationCPF, {
      message: "CPF inválido",
    }),

  crm: z.string()
    .transform((v) => v.toUpperCase().trim()) // normaliza antes de validar
    .pipe(
      z.string()
        .min(1, "CRM é obrigatório para médico")
        .regex(
          /^[A-Z]{2,3}[\/-]?[A-Z]{2}\s?\d{4,6}$/,
          "Formato inválido do CRM. Ex: SP-12345, CRM/SP 123456"
        )
    ),

  especialidade: z.string()
    .min(4, "Especialidade deve ter no mínimo 4 caracteres")
    .max(100, "Especialidade deve ter no máximo 100 caracteres"),
})
.superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "As senhas não coincidem",
      path: ["confirmPassword"],
    });
  }
});

export type RegisterFormMedico = z.input<typeof regFormMedico>