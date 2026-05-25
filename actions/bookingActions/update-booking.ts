"use server";

import { revalidatePath } from "next/cache";
import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";

import { protectedActionClient } from "@/lib/action-client";
import { getClinicAccessByUser, getPermissions } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

const inputSchema = z.object({
    appointmentId: z.string().uuid(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de data inválido (AAAA-MM-DD)"),
    time: z.string().regex(/^\d{2}:\d{2}$/, "Formato de hora inválido (HH:MM)"),
});

export const updateAppointment = protectedActionClient
    .inputSchema(inputSchema)
    .action(async ({ parsedInput: { appointmentId, date, time }, ctx }) => {
        const access = await getClinicAccessByUser(ctx.user.id);
        const permissions = getPermissions(access?.role);

        if (!access || !permissions.canUpdate) {
            return returnValidationErrors(inputSchema, {
                _errors: ["Você não tem permissão para editar agendamentos."],
            });
        }

        const appointment = await prisma.appointment.findUnique({
            where: {
                id: appointmentId,
            },
        });

        if (!appointment) {
            return returnValidationErrors(inputSchema, {
                _errors: ["Agendamento nao encontrado."],
            });
        }

        if (appointment.clinicId !== access.clinicId) {
            return returnValidationErrors(inputSchema, {
                _errors: ["Agendamento não pertence à sua clínica."],
            });
        }

        const [year, month, day] = date.split("-").map(Number);
        const [hours, minutes] = time.split(":").map(Number);
        const dateOnly = new Date(Date.UTC(year, month - 1, day));
        const timeOnly = new Date(Date.UTC(1970, 0, 1, hours, minutes, 0, 0));

        const existingAppointment = await prisma.appointment.findFirst({ // Valida se ja possuí agendamento para o dia desejado
            where: {
                professionalId: appointment.professionalId,
                date: dateOnly,
                time: timeOnly,
                id: { not: appointmentId }, //ignora o própro agendamento
            },
        });

        if (existingAppointment) {
            return returnValidationErrors(inputSchema, {
                _errors: ["Horário já está ocupado por outro agendamento."],
            });
        }

        const updatedAppoint = await prisma.appointment.update({
            where: {
                id: appointmentId,
            },
            data: {
                date: dateOnly,
                time: timeOnly,
            },
        });

        revalidatePath("/");
        revalidatePath("/appointments");

        return updatedAppoint;

    });
