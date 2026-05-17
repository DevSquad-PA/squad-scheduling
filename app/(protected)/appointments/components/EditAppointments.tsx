"use client";

import { useState, useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { updateAppointment } from "@/actions/bookingActions/update-booking";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Pencil } from "lucide-react";

type EditAppointmentDialogProps = {
  appointment: {
    id: string;
    data: string;
    hora: string;
  };
};

export default function EditAppointment({
  appointment,
}: EditAppointmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const queryClient = useQueryClient();

  // Converte a data inicial de DD/MM/YYYY para YYYY-MM-DD exigido pelo <input type="date">
  const [date, setDate] = useState(() => {
    const parts = appointment.data.split("/");
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${year}-${month}-${day}`;
    }
    return appointment.data;
  });
  
  const [time, setTime] = useState(appointment.hora);

  async function handleUpdate() {
    startTransition(async () => {
      try {
        const res = await updateAppointment({
          appointmentId: appointment.id,
          date,
          time,
        });

        if (res?.validationErrors || res?.serverError) {
          const errorMsg = res.validationErrors?._errors?.[0] || res.serverError || "Erro ao editar agendamento.";
          alert(errorMsg);
        } else {
          // Invalida o cache do React Query para atualizar a lista automaticamente na tela
          await queryClient.invalidateQueries({ queryKey: ["appointments"] });
          alert("Agendamento editado com sucesso!");
          setOpen(false);
        }
      } catch (error) {
        console.error(error);
        alert("Erro inesperado ao editar agendamento.");
      }
    });
  }

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
            <label className="text-sm font-medium">Data</label>

            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Hora</label>

            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              disabled={isPending}
            />
          </div>

          <Button onClick={handleUpdate} disabled={isPending}>
            {isPending ? "Salvando..." : "Salvar alterações"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}