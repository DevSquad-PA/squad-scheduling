"use client";

import { useState } from "react";

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
  const [date, setDate] = useState(appointment.data);
  const [time, setTime] = useState(appointment.hora);

  async function handleUpdate() {
    try {
      console.log({
        id: appointment.id,
        date,
        time,
      });

      // action/update aqui

    } catch (error) {
      console.log(error);
    }
  }

  return (
    <Dialog>
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
            <label>Data</label>

            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label>Hora</label>

            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>

          <Button onClick={handleUpdate}>
            Salvar alterações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}