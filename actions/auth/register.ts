"use server";

import { headers } from "next/headers";
import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";

import { actionClient } from "@/lib/action-client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const validateCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/\D/g, "");
  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleanCPF.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleanCPF.charAt(10))) return false;
  
  return true;
};

const registerSchema = z
  .object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z.string(),
    cpf: z
      .string()
      .min(11, "CPF deve ter pelo menos 11 dígitos")
      .refine((cpf) => validateCPF(cpf), {
        message: "CPF inválido",
      }),
    dateOfBirth: z
      .string()
      .refine(
        (date) => {
          const parsedDate = new Date(date);
          return !isNaN(parsedDate.getTime());
        },
        { message: "Data de nascimento inválida" }
      )
      .refine(
        (date) => {
          const parsedDate = new Date(date);
          const today = new Date();
          const age = today.getFullYear() - parsedDate.getFullYear();
          const monthDiff = today.getMonth() - parsedDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < parsedDate.getDate())) {
            return age - 1 >= 0;
          }
          return age >= 0;
        },
        { message: "Data de nascimento deve ser uma data válida" }
      ),
    phone: z
      .string()
      .min(10, "Telefone deve ter pelo menos 10 dígitos")
      .regex(/^[\d\s\(\)\-\+]+$/, "Telefone deve conter apenas números e caracteres de formatação"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export const register = actionClient
  .inputSchema(registerSchema)
  .action(async ({ parsedInput }) => {
    const { name, email, password, cpf, dateOfBirth, phone } = parsedInput;

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      returnValidationErrors(registerSchema, {
        _errors: ["Este email já está cadastrado."],
      });
    }

    try {
      const result = await auth.api.signUpEmail({
        body: {
          name,
          email,
          password,
        },
        headers: await headers(),
      });

      if (!result) {
        returnValidationErrors(registerSchema, {
          _errors: ["Erro ao criar conta."],
        });
      }

      if (result.user?.id) {   
        const cleanCPF = cpf.replace(/\D/g, "");
        const cleanPhone = phone.replace(/\D/g, "");
        const birthDate = new Date(dateOfBirth);
        
        const nameParts = name.trim().split(" ");
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : null;

        console.log("Updating user details for:", result.user.id);
        
        await prisma.user.update({
          where: { id: result.user.id },
          data: {
            emailVerified: true, // Auto verify since no verification logic is present
            cpf: cleanCPF,
            dateOfBirth: birthDate,
            phone: cleanPhone,
            firstName,
            lastName
          },
        });
      } else {
        console.error("No user ID returned from signUpEmail! BetterAuth payload:", result);
      }

      return {
        success: true,
        message: "Conta criada com sucesso!",
        user: result.user,
      };
    } catch (error) {
      returnValidationErrors(registerSchema, {
        _errors: [
          error instanceof Error
            ? error.message
            : "Erro ao criar conta. Tente novamente.",
        ],
      });
    }
  }
);
