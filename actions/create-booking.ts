"use server";

import { z } from "zod";
import { protectedActionClient } from "@/lib/action-client";
import { returnValidationErrors } from "next-safe-action";
import { prisma } from "@/lib/prisma";

const inputSchema = z.object({
  professionalId: z.string().uuid().optional(),
  patient: z.object({
    nome: z.string().min(3),
    cpf: z.string().optional(),
    endereco: z.string().optional(),
    contato: z.string().optional(),
  }),
  date: z.string(), // YYYY-MM-DD
  time: z.string(), // HH:MM
  services: z.array(z.string()).min(1),
});

export const createAppointment = protectedActionClient
  .inputSchema(inputSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { professionalId, patient, date, time, services } = parsedInput;
    try {
      console.log("createAppointment called with:", parsedInput);

      // derive session user from ctx (protectedActionClient adds it)
      const user = (ctx as any)?.user;
      if (!user?.id) {
        returnValidationErrors(inputSchema, { _errors: ["Não autorizado."] });
      }

      const clinicMember = await prisma.clinicMember.findFirst({ where: { userId: user.id }, select: { clinicId: true } });
      if (!clinicMember?.clinicId) {
        returnValidationErrors(inputSchema, { _errors: ["Usuário não pertence a nenhuma clínica."] });
      }

      const clinicId = clinicMember.clinicId;

      // create a patient record with submitted details
      const createdPatient = await prisma.patient.create({
        data: {
          clinicId,
          name: patient.nome,
          cpf: patient.cpf,
          address: patient.endereco,
          contact: patient.contato,
        },
      });
      console.log("created patient id:", createdPatient.id);

      // find professional
      let professional = null;
      if (professionalId) {
        professional = await prisma.professional.findUnique({ where: { id: professionalId } });
      }
      if (!professional) {
        professional = await prisma.professional.findFirst({ where: { clinicId } });
      }

      const dateObj = new Date(date);
      const timeObj = new Date(`${date}T${time}:00`);

      const appointment = await prisma.appointment.create({
        data: {
          clinicId,
          professionalId: professional?.id,
          patientId: createdPatient.id,
          date: dateObj,
          time: timeObj,
          services,
        },
      });

      console.log("created appointment id:", appointment.id);

      const mapped = {
        nome: patient.nome,
        data: new Date(appointment.date).toLocaleDateString("pt-BR"),
        hora: time,
        descricao: Array.isArray(services) ? services.join(", ") : String(services),
      };

      return { success: true, appointment: mapped, appointmentId: appointment.id };
    } catch (err) {
      console.error("Error in createAppointment:", err);
      returnValidationErrors(inputSchema, { _errors: [(err as Error)?.message || String(err)] });
    }
  });