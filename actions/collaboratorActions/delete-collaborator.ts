"use server";

import { revalidatePath } from "next/cache";
import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";

import { protectedActionClient } from "@/lib/action-client";
import { getClinicAccessByUser, getPermissions } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

const inputSchema = z.object({
  collaboratorId: z.string().uuid(),
});

export const deleteCollaborator = protectedActionClient
  .inputSchema(inputSchema)
  .action(async ({ parsedInput: { collaboratorId }, ctx }) => {
    const access = await getClinicAccessByUser(ctx.user.id);
    const permissions = getPermissions(access?.role);

    if (!access || !permissions.canDelete) {
      return returnValidationErrors(inputSchema, {
        _errors: ["Você não tem permissão para excluir colaboradores."],
      });
    }

    const currentMember = await prisma.clinicMember.findFirst({
      where: { userId: ctx.user.id },
      select: { clinicId: true },
    });

    if (!currentMember?.clinicId) {
      return returnValidationErrors(inputSchema, {
        _errors: ["Nenhuma clínica encontrada para este usuário."],
      });
    }

    if (currentMember.clinicId !== access.clinicId) {
      return returnValidationErrors(inputSchema, {
        _errors: ["Clínica inválida para este usuário."],
      });
    }

    const collaborator = await prisma.clinicMember.findFirst({
      where: {
        id: collaboratorId,
        clinicId: currentMember.clinicId,
      },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!collaborator) {
      return returnValidationErrors(inputSchema, {
        _errors: ["Colaborador não encontrado."],
      });
    }

    if (collaborator.userId === ctx.user.id) {
      return returnValidationErrors(inputSchema, {
        _errors: ["Não é possível excluir seu próprio usuário."],
      });
    }

    const deletedCollaborator = await prisma.clinicMember.delete({
      where: { id: collaboratorId },
    });

    revalidatePath("/settings");

    return deletedCollaborator;
  });
