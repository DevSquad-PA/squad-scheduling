"use server";

import { revalidatePath } from "next/cache";
import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";

import { protectedActionClient } from "@/lib/action-client";
import { prisma } from "@/lib/prisma";

const inputSchema = z.object({
  collaboratorId: z.string().uuid(),
  nome: z.string().min(3, "Nome obrigatório"),
  email: z.string().email("Email inválido"),
  contato: z.string().min(10, "Telefone inválido"),
  tipo: z.enum(["Administrador", "Atendimento", "Médico"], {
    message: "Selecione o tipo",
  }),
});

export const updateCollaborator = protectedActionClient
  .inputSchema(inputSchema)
  .action(async ({ parsedInput, ctx }) => {
    const currentMember = await prisma.clinicMember.findFirst({
      where: { userId: ctx.user.id },
      select: { clinicId: true },
    });

    if (!currentMember?.clinicId) {
      return returnValidationErrors(inputSchema, {
        _errors: ["Nenhuma clínica encontrada para este usuário."],
      });
    }

    const collaborator = await prisma.clinicMember.findFirst({
      where: {
        id: parsedInput.collaboratorId,
        clinicId: currentMember.clinicId,
      },
      include: {
        user: true,
      },
    });

    if (!collaborator?.userId || !collaborator.user) {
      return returnValidationErrors(inputSchema, {
        _errors: ["Colaborador não encontrado."],
      });
    }

    const email = parsedInput.email.toLowerCase();
    const userWithEmail = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (userWithEmail && userWithEmail.id !== collaborator.userId) {
      return returnValidationErrors(inputSchema, {
        _errors: ["Email já cadastrado para outro usuário."],
      });
    }

    let role = await prisma.role.findUnique({
      where: { description: parsedInput.tipo },
    });

    if (!role) {
      role = await prisma.role.create({
        data: { description: parsedInput.tipo },
      });
    }

    const nameParts = parsedInput.nome.trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || null;
    const phone = parsedInput.contato.replace(/\D/g, "");

    const [, updatedCollaborator] = await prisma.$transaction([
      prisma.user.update({
        where: { id: collaborator.userId },
        data: {
          name: parsedInput.nome,
          firstName,
          lastName,
          email,
          phone,
        },
      }),
      prisma.clinicMember.update({
        where: { id: parsedInput.collaboratorId },
        data: {
          roleId: role.id,
        },
        include: {
          role: true,
          user: true,
        },
      }),
    ]);

    revalidatePath("/settings");

    return updatedCollaborator;
  });
