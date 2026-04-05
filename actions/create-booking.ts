"use server";

import { z } from "zod";
import { protectedActionClient } from "@/lib/action-client";
import { returnValidationErrors } from "next-safe-action";
import { prisma } from "@/lib/prisma";
import { isPast } from "date-fns";

const inputSchema = z.object({
  clinicId: z.string().uuid(),
  professionalId: z.string().uuid(),
  patientId: z.string().uuid(),
  date: z.date(),
  time: z.date(),
  services: z.array(z.string()).min(1),
});

export const createAppointment = protectedActionClient
  .inputSchema(inputSchema)
  .action(async ({ parsedInput: { clinicId, professionalId, patientId, date, time, services }}) => {
      const appointmentDateTime = new Date(date);
      appointmentDateTime.setHours(
        time.getHours(),
        time.getMinutes(),
        0,
        0
      );

      if (isPast(appointmentDateTime)) {
        returnValidationErrors(inputSchema, {
          _errors: ["Data e hora já passaram."],
        });
      }

      const professional = await prisma.professional.findUnique({
        where: { id: professionalId },
      });

      if (!professional) {
        returnValidationErrors(inputSchema, {
          _errors: ["Profissional não encontrado."],
        });
      }

      if (professional.clinicId !== clinicId) {
        returnValidationErrors(inputSchema, {
          _errors: ["Profissional não pertence à clínica."],
        });
      }

      const existingAppointment = await prisma.appointment.findFirst({
        where: {
          professionalId,
          date,
          time,
        },
      });

      if (existingAppointment) {
        returnValidationErrors(inputSchema, {
          _errors: ["Horário já está ocupado."],
        });
      }

      const appointment = await prisma.appointment.create({
        data: {
          clinicId,
          professionalId,
          patientId,
          date,
          time,
          services,
        },
      });

      return appointment;
    }
  );