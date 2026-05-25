"use client";

import { useQuery } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardAppointmentsByCurrentUser } from "@/data/appointments";
import { filterAppointments, parseInputDate } from "@/lib/utils";
import type { PropsAppointment } from "@/types/appointment/appointments";

import DeleteAppointment from "./DeleteAppointments";
import EditAppointment from "./EditAppointments";

type AppointmentsListProps = {
  clinicId: string;
  initialAppointments: PropsAppointment[];
  search: string;
  selectedDate: string;
  canUpdate: boolean;
  canDelete: boolean;
};

async function fetchAppointments() {
  return getDashboardAppointmentsByCurrentUser();
}

export default function AppointmentsList({
  clinicId,
  initialAppointments,
  search,
  selectedDate,
  canUpdate,
  canDelete,
}: AppointmentsListProps) {
  const { data: appointments = initialAppointments, isFetching } = useQuery({
    queryKey: ["appointments", clinicId],
    queryFn: fetchAppointments,
    initialData: initialAppointments,
    staleTime: 30_000,
  });

  const parsedSelectedDate = parseInputDate(selectedDate) ?? new Date();
  const filteredAppointments = filterAppointments(
    appointments,
    search,
    parsedSelectedDate,
  );

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {filteredAppointments.map((appointment, index) => (
          <Card
            key={`${appointment.data}-${appointment.hora}-${appointment.cpf}-${index}`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-semibold">
                {appointment.cliente ?? "N/A"}
              </CardTitle>

              {(canUpdate || canDelete) && (
                <div className="flex gap-2">
                  {canUpdate && (
                    <EditAppointment
                      appointment={{
                        professionalId: appointment.professionalId,
                        id: appointment.id,
                        data: appointment.data,
                        hora: appointment.hora,
                      }}
                    />
                  )}

                  {canDelete && (
                    <DeleteAppointment appointmentId={appointment.id} />
                  )}
                </div>
              )}
            </CardHeader>

            <CardContent className="flex flex-col gap-1 text-sm">
              <p>
                <strong>Profissional:</strong> {appointment.nome ?? "N/A"}
              </p>
              <p>
                <strong>Serviço:</strong> {appointment.descricao ?? "N/A"}
              </p>
              <p>
                <strong>Data:</strong> {appointment.data ?? "N/A"}
              </p>
              <p>
                <strong>Hora:</strong> {appointment.hora ?? "N/A"}
              </p>
              <p>
                <strong>Contato:</strong> {appointment.contato ?? "N/A"}
              </p>
              <p>
                <strong>CPF:</strong> {appointment.cpf ?? "N/A"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {isFetching ? (
        <>
          <hr className="border-0.5 border-primary" />
          <p className="w-full text-center text-sm text-gray-500">
            Carregando...
          </p>
        </>
      ) : filteredAppointments.length === 0 ? (
        <>
          <hr className="border-0.5 border-primary" />
          <p className="w-full text-center text-sm text-gray-500">
            Nenhum agendamento
          </p>
        </>
      ) : null}
    </>
  );
}
