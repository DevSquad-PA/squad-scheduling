"use server";

import { isPast } from "date-fns";
import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";

import { Prisma } from "@/generated/prisma/client";
import { protectedActionClient } from "@/lib/action-client";
import { getClinicAccessByUser, getPermissions } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

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
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
    time: z.string().regex(/^\d{2}:\d{2}$/), // HH:mm
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
  .action(async ({ parsedInput: { clinicId, professionalId, patientId, patient, date, time, services }, ctx }) => {
    const access = await getClinicAccessByUser(ctx.user.id);
    const permissions = getPermissions(access?.role);

    if (!access || access.clinicId !== clinicId || !permissions.canCreate) {
      return returnValidationErrors(inputSchema, {
        _errors: ["Você não tem permissão para criar agendamentos."],
      });
    }

    // parsedInput.date is "YYYY-MM-DD", parsedInput.time is "HH:mm"
    const [year, month, day] = date.split("-").map(Number)
    const [hours, minutes] = time.split(":").map(Number)

    // Construct UTC moments so the stored calendar day is exactly the chosen one.
    const appointmentDateTimeUTC = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0, 0))

    const dateOnly = new Date(Date.UTC(year, month - 1, day))
    const timeOnly = new Date(Date.UTC(1970, 0, 1, hours, minutes, 0, 0))

    if (isPast(appointmentDateTimeUTC)) {
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
      const existingPatientWithCpf = await prisma.patient.findFirst({
        where: {
          clinicId,
          cpf: patient.cpf,
        },
        select: {
          id: true,
        },
      });

      if (existingPatientWithCpf) {
        return returnValidationErrors(inputSchema, {
          _errors: ["CPF j\u00e1 cadastrado para outro cliente."],
        });
      }

      const createdPatient = await prisma.patient.create({
          data: {
            clinicId,
            firstName: patient.name,
            lastName: "",
            cpf: patient.cpf,
            phone: patient.phone,
            addressNumber: patient.address,
          },
        })
        .catch((error: unknown) => {
          if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
          ) {
            return returnValidationErrors(inputSchema, {
              _errors: ["CPF j\u00e1 cadastrado para outro cliente."],
            });
          }

          throw error;
        });

      resolvedPatientId = createdPatient.id;
    }

    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        professionalId,
        date: dateOnly,
        time: timeOnly,
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
        date: dateOnly,
        time: timeOnly,
        services,
      },
    });

    console.log("[create-booking] created appointment:", appointment)
    return appointment;
    }
  );
