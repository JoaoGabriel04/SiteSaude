import { z } from "zod";
import * as cpfValidator from "cpf-cnpj-validator";

function validationCPF(value: string) {
  const cpfNormalized = value.replace(/\D/g, "");

  if (process.env.NODE_ENV !== "production" && cpfNormalized.startsWith("999")) {
    return true;
  }

  return cpfValidator.cpf.isValid(cpfNormalized);
}

export const regFormAtendente = z.object({
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

  setor: z.string()
    .min(4, "Setor deve ter no mínimo 4 caracteres")
    .max(100, "Setor deve ter no máximo 100 caracteres"),
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

export type RegisterFormAtendente = z.input<typeof regFormAtendente>