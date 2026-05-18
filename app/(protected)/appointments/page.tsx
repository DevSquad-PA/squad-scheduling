import { headers } from "next/headers";

import { getDashboardAppointmentsByClinic } from "@/data/appointments";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatInputDate, getSingleParam, parseInputDate } from "@/lib/utils";

import AppointmentsDialog from "./components/AppointmentsDialog";
import AppointmentsFilters from "./components/AppointmentsFilters";
import AppointmentsList from "./components/AppointmentsList";

type AppointmentsPageProps = {
  searchParams: Promise<{
    search?: string | string[];
    date?: string | string[];
  }>;
};

export default async function AppointmentsPage({
  searchParams,
}: AppointmentsPageProps) {
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

  const params = await searchParams;
  const search = getSingleParam(params.search);
  const inputDate = getSingleParam(params.date) || formatInputDate(new Date());
  const selectedDate = parseInputDate(inputDate) ?? new Date();
  const selectedInputDate = formatInputDate(selectedDate);

  return (
    <div className="flex flex-col gap-4 p-8">
      <h2 className="mb-2 text-base font-bold">Agendamentos</h2>

      <AppointmentsDialog clinicId={clinicMember.clinicId} />

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-start">
        <AppointmentsFilters
          key={`${search}-${selectedInputDate}`}
          search={search}
          date={selectedInputDate}
        />        
      </div>

      <AppointmentsList
        clinicId={clinicMember.clinicId}
        initialAppointments={appointments}
        search={search}
        selectedDate={selectedInputDate}
      />
    </div>
  );
}
