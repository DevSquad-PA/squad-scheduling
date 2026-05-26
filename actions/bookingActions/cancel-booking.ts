"use server";

import { revalidatePath } from "next/cache";
import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";

import { protectedActionClient } from "@/lib/action-client";
import { getClinicAccessByUser, getPermissions } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

const inputSchema = z.object({
  appointmentId: z.string().uuid(),
});

export const cancelAppointment = protectedActionClient
  .inputSchema(inputSchema)
  .action(async ({ parsedInput: { appointmentId }, ctx }) => {
    const access = await getClinicAccessByUser(ctx.user.id);
    const permissions = getPermissions(access?.role);

    if (!access || !permissions.canDelete) {
      return returnValidationErrors(inputSchema, {
        _errors: ["Você não tem permissão para excluir agendamentos."],
      });
    }

    const appointment = await prisma.appointment.findUnique({
      where: {
        id: appointmentId,
      },
      include: {
        patient: true,
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

    // Usamos os métodos UTC para evitar que o fuso horário (ex: UTC-3 do Brasil)
    // desloque a data do agendamento para o dia anterior e altere as horas locais.
    const dateObj = new Date(appointment.date);
    const timeObj = new Date(appointment.time);

    const dateTime = new Date(
      dateObj.getUTCFullYear(),
      dateObj.getUTCMonth(),
      dateObj.getUTCDate(),
      timeObj.getUTCHours(),
      timeObj.getUTCMinutes(),
      0,
      0
    );

    if (dateTime <= new Date()) {
      return returnValidationErrors(inputSchema, {
        _errors: ["Não é possível cancelar um agendamento passado."],
      });
    }

    const cancelledAppointment = await prisma.appointment.delete({
      where: {
        id: appointmentId,
      },
    });

    revalidatePath("/");
    revalidatePath("/appointments"); // validar rota para condizer com que está definido no layout

    return cancelledAppointment;
  });
