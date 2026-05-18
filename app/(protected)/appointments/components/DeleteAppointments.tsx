"use client";

import { useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { cancelAppointment } from "@/actions/bookingActions/cancel-booking";
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
  const [isPending, startTransition] = useTransition();
  const queryClient = useQueryClient();

  async function handleDelete() {
    startTransition(async () => {
      try {
        const res = await cancelAppointment({ appointmentId });
        
        if (res?.validationErrors || res?.serverError) {
          // Exibe os erros de validação ou do servidor
          const errorMsg = res.validationErrors?._errors?.[0] || res.serverError || "Erro ao excluir agendamento.";
          alert(errorMsg);
        } else {
          // Invalida o cache do React Query para atualizar a lista automaticamente na tela
          await queryClient.invalidateQueries({ queryKey: ["appointments"] });
          alert("Agendamento excluído com sucesso!");
        }
      } catch (error) {
        console.error(error);
        alert("Erro inesperado ao excluir agendamento.");
      }
    });
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