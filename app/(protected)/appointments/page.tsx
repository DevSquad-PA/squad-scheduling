import { headers } from "next/headers";

import { getDashboardAppointmentsByClinic } from "@/data/appointments";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import AppointmentsClient from "./components/AppointmentsClient";

export default async function AppointmentsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return <div className="p-8">Voce precisa estar logado.</div>;
  }

  const clinicMember = await prisma.clinicMember.findFirst({
    where: { userId: session.user.id },
    select: { clinicId: true },
  });

  if (!clinicMember?.clinicId) {
    return (
      <div className="p-8">Nenhuma clinica encontrada para o usuario.</div>
    );
  }

  const appointments = await getDashboardAppointmentsByClinic(
    clinicMember.clinicId,
  );

  return <AppointmentsClient initial={appointments} />;
}
