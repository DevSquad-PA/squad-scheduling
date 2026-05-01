"use server";

import { z } from "zod";
import { protectedActionClient } from "@/lib/action-client";
import { returnValidationErrors } from "next-safe-action";
import { prisma } from "@/lib/prisma";
import { isPast } from "date-fns";

const newPatientSchema = z.object({
  name: z.string().min(3, "Nome obrigatório"),
  cpf: z.string().min(11, "CPF inválido").max(11, "CPF inválido"),
  phone: z.string().min(11, "Telefone inválido").max(11, "Telefone inválido"),
  address: z.string().min(3, "Endereço obrigatório"),
});

const inputSchema = z
  .object({
    clinicId: z.string().uuid(),
    professionalId: z.string().uuid(),
    patientId: z.string().uuid().optional(),
    patient: newPatientSchema.optional(),
    date: z.date(),
    time: z.date(),
    services: z.array(z.string()).min(1),
  })
  .superRefine((data, ctx) => {
    if (!data.patientId && !data.patient) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Informe um cliente existente ou crie um novo cliente.",
      });
    }
  });

export const createAppointment = protectedActionClient
  .inputSchema(inputSchema)
  .action(async ({ parsedInput: { clinicId, professionalId, patientId, patient, date, time, services } }) => {
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

    let resolvedPatientId = patientId;

    if (patientId) {
      const existingPatient = await prisma.patient.findUnique({
        where: { id: patientId },
      });

      if (!existingPatient || existingPatient.clinicId !== clinicId) {
        returnValidationErrors(inputSchema, {
          _errors: ["Cliente não encontrado ou não pertence à clínica."],
        });
      }
    } else if (patient) {
      const createdPatient = await prisma.patient.create({
        data: {
          clinicId,
          firstName: patient.name,
          lastName: "",
          cpf: patient.cpf,
          phone: patient.phone,
          addressNumber: patient.address,
        },
      });

      resolvedPatientId = createdPatient.id;
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
        patientId: resolvedPatientId,
        date,
        time,
        services,
      },
    });

    return appointment;
    }
  );