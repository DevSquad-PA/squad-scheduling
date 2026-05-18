"use server";

import { revalidatePath } from "next/cache";
import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";

import { protectedActionClient } from "@/lib/action-client";
import { prisma } from "@/lib/prisma";

const inputSchema = z.object({
  appointmentId: z.string().uuid(),
});

export const cancelAppointment = protectedActionClient
  .inputSchema(inputSchema)
  .action(async ({ parsedInput: { appointmentId } }) => {
    const appointment = await prisma.appointment.findUnique({
      where: {
        id: appointmentId,
      },
      include: {
        patient: true,
      },
    });

    if (!appointment) {
      returnValidationErrors(inputSchema, {
        _errors: ["Agendamento nao encontrado."],
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
      returnValidationErrors(inputSchema, {
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
