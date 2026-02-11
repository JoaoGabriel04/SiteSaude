import {z} from "zod"

export const loginFormSchema = z.object({
  email: z.email("Email inválido").min(1, "O email é obrigatório."),
  password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres."),
});

export type LoginFormData = z.infer<typeof loginFormSchema>;