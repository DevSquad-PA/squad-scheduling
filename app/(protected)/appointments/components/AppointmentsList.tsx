"use client";

import { useQuery } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CardAppointment from "./CardAppointment";
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
      <div className="flex flex-col">

        {!isFetching && filteredAppointments.length > 0 &&
          <div className="grid grid-cols-[2fr_2fr_1fr_2fr] items-center gap-4 py-2 font-bold">
            <p>Cliente</p>
            <p>Serviço</p>
            <p>Hora</p>
            <p>Contato</p>
          </div>
        }

        {!isFetching && filteredAppointments.map((appointment, index) => (

          <div key={appointment.id}>

            <CardAppointment

              appointment={appointment}
              trigger={

                <div className="grid grid-cols-[2fr_2fr_1fr_2fr] items-center hover:text-primary cursor-pointer"
                  key={appointment.id}>


                  <p>{appointment.cliente}</p>
                  <p>{appointment.descricao}</p>
                  <p>{appointment.hora}</p>
                  <p>{appointment.contato.replace(
                    /^(\d{2})(\d{5})(\d{4})$/,
                    "($1) $2-$3"
                  )}</p>
                </div>

              }></CardAppointment>

            <hr className="border-0.5 border-primary" />

          </div>


        ))}
      </div>

      {isFetching ? (
        <>
          <hr className="border-0.5 border-primary" />
          <p className="text-sm text-gray-500 w-full text-center">
            Carregando...
          </p>
        </>
      ) : filteredAppointments.length === 0 ? (
        <>
          <hr className="border-0.5 border-primary" />
          <p className="text-sm text-gray-500 w-full text-center">
            Nenhum agendamento
          </p>
        </>
      ) : null}
    </>
  );
}
