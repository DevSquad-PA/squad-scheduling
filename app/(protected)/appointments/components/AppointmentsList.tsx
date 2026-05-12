"use client";

import { useQuery } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardAppointmentsByCurrentUser } from "@/data/appointments";
import { filterAppointments, parseInputDate } from "@/lib/utils";
import type { PropsAppointment } from "@/types/appointment/appointments";

type AppointmentsListProps = {
  clinicId: string;
  initialAppointments: PropsAppointment[];
  search: string;
  selectedDate: string;
};

async function fetchAppointments() {
  return getDashboardAppointmentsByCurrentUser();
}

export default function AppointmentsList({
  clinicId,
  initialAppointments,
  search,
  selectedDate,
}: AppointmentsListProps) {
  const { data: appointments = initialAppointments } = useQuery({
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
            <CardHeader>
              <CardTitle>{appointment.nome ?? "—"}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1 text-sm">
              <p>
                <strong>Servico:</strong> {appointment.descricao ?? "—"}
              </p>
              <p>
                <strong>Hora:</strong> {appointment.hora ?? "N/A"}
              </p>
              <p>
                <strong>Cliente:</strong> {appointment.cliente ?? "N/A"}
              </p>
              <p>
                <strong>Contato:</strong> {appointment.contato ?? "N/A"}
              </p>
              <p>
                <strong>CPF:</strong> {appointment.cpf ?? "N/A"}
              </p>
              <p>
                <strong>Endereco:</strong> {appointment.endereco ?? "N/A"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAppointments.length === 0 && (
        <p className="text-sm text-gray-500">Nenhum agendamento</p>
      )}
    </>
  );
}
