"use server";

import { headers } from "next/headers";
import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";

import { actionClient } from "@/lib/action-client";
import { auth } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export const login = actionClient
  .inputSchema(loginSchema)
  .action(async ({ parsedInput }) => {
    const { email, password } = parsedInput;

    try {
      const result = await auth.api.signInEmail({
        body: {
          email,
          password,
        },
        headers: await headers(),
      });

      if (!result) {
        returnValidationErrors(loginSchema, {
          _errors: ["Erro ao fazer login."],
        });
      }

      if ("token" in result && result.token === null) {
        returnValidationErrors(loginSchema, {
          _errors: ["Email ou senha inválidos."],
        });
      }

      return {
        success: true,
        message: "Login realizado com sucesso!",
        user: result.user,
      };
    } catch (error) {
      returnValidationErrors(loginSchema, {
        _errors: [
          error instanceof Error
            ? error.message
            : "Erro ao fazer login. Tente novamente.",
        ],
      });
    }
  }
);
