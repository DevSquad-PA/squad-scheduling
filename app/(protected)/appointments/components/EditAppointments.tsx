"use client";

import { useState } from "react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { updateAppointment } from "@/actions/bookingActions/update-booking";
import { getAvailableTime } from "@/actions/get-date-available-time";

import { useToast } from "@/components/ui/toast";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Pencil } from "lucide-react";

type EditAppointmentDialogProps = {
  appointment: {
    id: string;
    data: string;
    hora: string;
    professionalId: string;
  };
};

export default function EditAppointment({
  appointment,
}: EditAppointmentDialogProps) {
  const [open, setOpen] = useState(false);

  const queryClient = useQueryClient();
  const toast = useToast();

  // Converte DD/MM/YYYY -> YYYY-MM-DD
  const [date, setDate] = useState(() => {
    const parts = appointment.data.split("/");

    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${year}-${month}-${day}`;
    }

    return appointment.data;
  });

  const [time, setTime] = useState(appointment.hora);

  const { data: availableTimes = [] } = useQuery<string[]>({
    queryKey: ["availableTimes", appointment.professionalId, date],

    enabled: Boolean(date && appointment.professionalId),

    queryFn: async () => {
      const [year, month, day] = date.split("-").map(Number);

      const parsedDate = new Date(year, month - 1, day);

      const res = await getAvailableTime({
        professionalId: appointment.professionalId,
        date: parsedDate,
      });

      return res?.data ?? [];
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await updateAppointment({
        appointmentId: appointment.id,
        date,
        time,
      });

      if (res?.validationErrors || res?.serverError) {
        throw new Error(
          res.validationErrors?._errors?.[0] ||
            res.serverError ||
            "Erro ao editar agendamento."
        );
      }

      return res;
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["appointments"],
      });

      toast.success("Agendamento editado com sucesso!");

      setDate(() => {
  const parts = appointment.data.split("/");

  if (parts.length === 3) {
    const [day, month, year] = parts;
    return `${year}-${month}-${day}`;
  }

  return appointment.data;
});

setTime("");

      setOpen(false);
    },

    onError: (error: Error) => {
      console.error(error);

      toast.error(
        error.message || "Erro inesperado ao editar agendamento."
      );
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost">
          <Pencil className="h-5 w-5" />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar agendamento</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">
              Data
            </label>

            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={mutation.isPending}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">
              Hora
            </label>

            <Select
              value={time}
              onValueChange={setTime}
              disabled={
                !availableTimes.length ||
                mutation.isPending
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Horário disponível" />
              </SelectTrigger>

              <SelectContent>
                {availableTimes.length === 0 ? (
                  <SelectItem value="empty" disabled>
                    Nenhum horário disponível
                  </SelectItem>
                ) : (
                  availableTimes.map((slot) => (
                    <SelectItem
                      key={slot}
                      value={slot}
                    >
                      {slot}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending
              ? "Salvando..."
              : "Salvar alterações"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}