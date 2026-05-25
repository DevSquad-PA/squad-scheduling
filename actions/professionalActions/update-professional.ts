"use server";

import { revalidatePath } from "next/cache";
import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";

import { protectedActionClient } from "@/lib/action-client";
import { getClinicAccessByUser, getPermissions } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

const inputSchema = z.object({
    professionalId: z.string().uuid(),
    specialty: z.string().optional(),
    services: z.array(z.string()).optional(),
    name: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    cpf: z.string().optional(),
    dateOfBirth: z.coerce.date().optional(),
});

export const updateProfessional = protectedActionClient
    .inputSchema(inputSchema)
    .action(async ({ parsedInput: { professionalId, specialty, services, name, phone, email, cpf, dateOfBirth }, ctx }) => {
        const access = await getClinicAccessByUser(ctx.user.id);
        const permissions = getPermissions(access?.role);

        if (!access || !permissions.canUpdate) {
            return returnValidationErrors(inputSchema, {
                _errors: ["Você não tem permissão para editar profissionais."],
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

        const updatedProf = await prisma.professional.update({
            where: {
                id: professionalId,
            },
            data: {
                specialty: specialty,
                services: services,
                user: {
                    update: {
                        name: name,
                        phone: phone,
                        email: email,
                        cpf: cpf,
                        dateOfBirth: dateOfBirth,
                    }
                }
            }
        });

        revalidatePath("/");
        revalidatePath("/appointments");
        revalidatePath("/professionals")

        return updatedProf;

    });
