"use server";

import { revalidatePath } from "next/cache";
import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";

import { protectedActionClient } from "@/lib/action-client";
import { prisma } from "@/lib/prisma";

const inputSchema = z.object({
    professionalId: z.string().uuid(),
});

export const deleteProfessional = protectedActionClient
    .inputSchema(inputSchema)
    .action(async ({ parsedInput: { professionalId } }) => {
        const professional = await prisma.professional.findUnique({
            where: {
                id: professionalId,
            },
            include: {
                clinic: true,
            },
        });

        if (!professional) {
            returnValidationErrors(inputSchema, {
                _errors: ["Profissional nao encontrado."],
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