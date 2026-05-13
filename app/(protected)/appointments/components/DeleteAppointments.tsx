"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Button } from "@/components/ui/button";

import { Trash } from "lucide-react";

type DeleteAppointmentDialogProps = {
  appointmentId: string;
};

export default function DeleteAppointment({
  appointmentId,
}: DeleteAppointmentDialogProps) {
  async function handleDelete() {
    try {
      console.log(appointmentId);

      // delete action aqui

    } catch (error) {
      console.log(error);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="icon" variant="ghost">
          <Trash className="h-5 w-5 hover:text-red-500" />
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Deseja excluir este agendamento?
          </AlertDialogTitle>

          <AlertDialogDescription>
            Essa ação não poderá ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>
            Cancelar
          </AlertDialogCancel>

          <AlertDialogAction onClick={handleDelete}>
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}