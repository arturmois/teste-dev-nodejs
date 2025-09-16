import { z } from "zod";

export const signupSchema = z
  .object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    username: z
      .string()
      .min(3, "Nome de usuário deve ter pelo menos 3 caracteres"),
    password: z
      .string()
      .min(6, "Senha deve ter pelo menos 6 caracteres")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Senha deve conter pelo menos uma letra maiúscula, uma letra minúscula e um número",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Senhas não coincidem",
    path: ["confirmPassword"],
  });

export type SignupSchema = z.infer<typeof signupSchema>;
