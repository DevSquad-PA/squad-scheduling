"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { getClinicAccessByUser } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { formatHora } from "@/lib/utils";
import type { PropsAppointment } from "@/types/appointment/appointments";

type GetAppointmentsByClinicOptions = {
  professionalId?: string | null;
};

export const getAppointmentsByClinic = async (
  clinicId: string,
  options: GetAppointmentsByClinicOptions = {},
) => {
  return await prisma.appointment.findMany({
    where: {
      clinicId,
      ...(options.professionalId
        ? { professionalId: options.professionalId }
        : {}),
    },
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
  clinicId: string,
  options: GetAppointmentsByClinicOptions = {},
): Promise<PropsAppointment[]> => {
  const appointments = await getAppointmentsByClinic(clinicId, options);

  return appointments.map((appointment) => {
    const professionalName = appointment.professional?.user?.name ||
      [appointment.professional?.user?.firstName, appointment.professional?.user?.lastName].filter(Boolean).join(" ") ||
      "Sem profissional";

    const patientName = [appointment.patient?.firstName, appointment.patient?.lastName].filter(Boolean).join(" ") || "Sem nome";

    return {
      id: appointment.id,
      nome: professionalName,
      data: new Date(appointment.date).toLocaleDateString("pt-BR", {
        timeZone: "UTC",
      }),
      hora: formatHora(appointment.time),
      descricao: Array.isArray(appointment.services)
        ? appointment.services.join(", ")
        : "",
      cliente: patientName,
      endereco: appointment.patient?.addressNumber ?? "Sem endereco",
      contato: appointment.patient?.phone ?? "Sem contato",
      cpf: appointment.patient?.cpf ?? "Sem CPF",
      email: appointment.patient?.email ?? "Sem email",
    };
  });
};

export const getDashboardAppointmentsByCurrentUser = async (): Promise<PropsAppointment[]> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const access = await getClinicAccessByUser(session.user.id);

  if (!access?.clinicId) {
    throw new Error("Clinic not found");
  }

  return getDashboardAppointmentsByClinic(access.clinicId, {
    professionalId: access.role === "Médico" ? access.professionalId : null,
  });
};
