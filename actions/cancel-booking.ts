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
  .action(async ({ parsedInput: { appointmentId }, ctx: { user } }) => {
    const appointment = await prisma.appointment.findUnique({
      where: {
        id: appointmentId,
      },
      include: {
        patient: true,
        professional: true,
      },
    });

    if (!appointment) {
      returnValidationErrors(inputSchema, {
        _errors: ["Agendamento não encontrado."],
      });
    }

    // permitir que o profissional responsável cancele, ou um membro da clínica (ex: admin)
    const isProfessionalOwner = appointment.professional && appointment.professional.userId === user.id;

    const clinicMember = await prisma.clinicMember.findFirst({
      where: { userId: user.id, clinicId: appointment.clinicId },
    });

    if (!isProfessionalOwner && !clinicMember) {
      returnValidationErrors(inputSchema, {
        _errors: ["Você não tem permissão para cancelar este agendamento."],
      });
    }

    const dateTime = new Date(appointment.date);
    dateTime.setHours(
      appointment.time.getHours(),
      appointment.time.getMinutes(),
      0,
      0
    );

    if (dateTime <= new Date()) {
      returnValidationErrors(inputSchema, {
        _errors: ["Não é possível cancelar um agendamento passado."],
      });
    }

    if ((appointment as any).status === "cancelled") {
      returnValidationErrors(inputSchema, {
        _errors: ["Este agendamento já foi cancelado."],
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