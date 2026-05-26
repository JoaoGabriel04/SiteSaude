import { z } from "zod";
import { Role } from "../../generated/prisma/index.js";
import { validationCPF } from "../utils/validaCpfCns.js";

export const registerUser = z
  .object({
    nome: z.string().min(3).max(100),

    cpf: z
      .string()
      .refine((val) => {
        try { validationCPF(val); return true; } catch { return false; }
      }, "CPF inválido")
      .transform((val) => val.replace(/\D/g, "")),

    password: z
      .string()
      .min(8)
      .regex(
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,30}$/,
        "A senha deve ter no mínimo 8 caracteres, com letras maiúsculas, minúsculas, número e caractere especial"
      ),

    nascimento: z.string()
      .refine((v) => !isNaN(new Date(v).getTime()), { message: "Data de nascimento inválida" })
      .transform((v) => new Date(v).toISOString()),

    email: z.string().email(),

    avatar: z.string().url().optional(),

    role: z.nativeEnum(Role),

    fone: z.string().regex(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/),

    crm: z.string().optional(),

    especialidade: z.string().optional(),

    setor: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === Role.MEDICO) {
      if (!data.crm) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "CRM é obrigatório para médico",
          path: ["crm"],
        });
      }
      if (!data.especialidade) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Especialidade é obrigatória para médico",
          path: ["especialidade"],
        });
      }
      if (data.setor) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Setor só pode ser informado para atendentes",
          path: ["setor"],
        });
      }
    }

    if (data.role === Role.ATENDENTE) {
      if (!data.setor) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Setor é obrigatório para atendente",
          path: ["setor"],
        });
      }
      if (data.crm) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "CRM só pode ser informado para médicos",
          path: ["crm"],
        });
      }
      if (data.especialidade) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Especialidade só pode ser informada para médicos",
          path: ["especialidade"],
        });
      }
    }

    if (data.role === Role.ADMIN) {
      if (data.crm) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "CRM só pode ser informado para médicos",
          path: ["crm"],
        });
      }
      if (data.especialidade) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Especialidade só pode ser informada para médicos",
          path: ["especialidade"],
        });
      }
      if (data.setor) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Setor só pode ser informado para atendentes",
          path: ["setor"],
        });
      }
    }
  });
