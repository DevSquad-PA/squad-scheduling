import { headers } from "next/headers";

import { getDashboardAppointmentsByClinic } from "@/data/appointments";
import { auth } from "@/lib/auth";
import { getClinicAccessByUser, getPermissions } from "@/lib/permissions";
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

  const access = await getClinicAccessByUser(session.user.id);

  if (!access) {
    return (
      <div className="p-8">Nenhuma clinica encontrada para o usuario.</div>
    );
  }

  const permissions = getPermissions(access.role);
  const appointments = await getDashboardAppointmentsByClinic(
    access.clinicId,
    {
      professionalId: access.role === "Médico" ? access.professionalId : null,
    },
  );

  const params = await searchParams;
  const search = getSingleParam(params.search);
  const inputDate = getSingleParam(params.date) || formatInputDate(new Date());
  const selectedDate = parseInputDate(inputDate) ?? new Date();
  const selectedInputDate = formatInputDate(selectedDate);

  return (
    <div className="flex flex-col gap-4 p-8">
      <h2 className="mb-2 text-base font-bold">Agendamentos</h2>

      {permissions.canCreate && (
        <AppointmentsDialog clinicId={access.clinicId} />
      )}

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-start">
        <AppointmentsFilters
          key={`${search}-${selectedInputDate}`}
          search={search}
          date={selectedInputDate}
        />        
      </div>

      <AppointmentsList
        clinicId={access.clinicId}
        initialAppointments={appointments}
        search={search}
        selectedDate={selectedInputDate}
        canUpdate={permissions.canUpdate}
        canDelete={permissions.canDelete}
      />
    </div>
  );
}
