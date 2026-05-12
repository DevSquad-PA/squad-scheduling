"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatHora } from "@/lib/utils";
import type { PropsAppointment } from "@/types/appointment/appointments";

export const getAppointmentsByClinic = async (clinicId: string) => {
  return await prisma.appointment.findMany({
    where: { clinicId },
    include: {
      professional: {
        include: {
          user: true,
        },
      },
      patient: true,
    },
    orderBy: [{ date: "asc" }, { time: "asc" }],
  });
};

export const getDashboardAppointmentsByClinic = async (
  clinicId: string
): Promise<PropsAppointment[]> => {
  const appointments = await getAppointmentsByClinic(clinicId);

  return appointments.map((appointment) => ({
    nome: appointment.professional?.clinicId ?? "Sem profissional",
    data: new Date(appointment.date).toLocaleDateString("pt-BR", {
      timeZone: "UTC",
    }),
    hora: formatHora(appointment.time),
    descricao: Array.isArray(appointment.services)
      ? appointment.services.join(", ")
      : "",
    cliente: appointment.patient?.firstName ?? "Sem nome",
    endereco: appointment.patient?.addressNumber ?? "Sem endereco",
    contato: appointment.patient?.phone ?? "Sem contato",
    cpf: appointment.patient?.cpf ?? "Sem CPF",
    email: appointment.patient?.email ?? "Sem email",
  }));
};

export const getDashboardAppointmentsByCurrentUser = async (): Promise<PropsAppointment[]> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const clinicMember = await prisma.clinicMember.findFirst({
    where: { userId: session.user.id },
    select: { clinicId: true },
  });

  if (!clinicMember?.clinicId) {
    throw new Error("Clinic not found");
  }

  return getDashboardAppointmentsByClinic(clinicMember.clinicId);
};
