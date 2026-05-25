"use server";

import { revalidatePath } from "next/cache";
import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";

import { protectedActionClient } from "@/lib/action-client";
import { getClinicAccessByUser, getPermissions } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

const inputSchema = z.object({
    professionalId: z.string().uuid(),
});

export const deleteProfessional = protectedActionClient
    .inputSchema(inputSchema)
    .action(async ({ parsedInput: { professionalId }, ctx }) => {
        const access = await getClinicAccessByUser(ctx.user.id);
        const permissions = getPermissions(access?.role);

        if (!access || !permissions.canDelete) {
            return returnValidationErrors(inputSchema, {
                _errors: ["Você não tem permissão para excluir profissionais."],
            });
        }

        const professional = await prisma.professional.findUnique({
            where: {
                id: professionalId,
            },
            include: {
                clinic: true,
            },
        });

        if (!professional) {
            return returnValidationErrors(inputSchema, {
                _errors: ["Profissional nao encontrado."],
            });
        }

        if (professional.clinicId !== access.clinicId) {
            return returnValidationErrors(inputSchema, {
                _errors: ["Profissional não pertence à sua clínica."],
            });
        }

        const deletedProf = await prisma.professional.delete({
            where: {
                id: professionalId,
            },
        });

        revalidatePath("/");
        revalidatePath("/appointments");
        revalidatePath("/professionals")

        return deletedProf;

    });
