"use client";

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { cancelAppointment } from "@/actions/bookingActions/cancel-booking";

import { useToast } from "@/components/ui/toast";

import {
  AlertDialog,
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
  const queryClient = useQueryClient();

  const toast = useToast();

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await cancelAppointment({
        appointmentId,
      });

      if (res?.validationErrors || res?.serverError) {
        throw new Error(
          res.validationErrors?._errors?.[0] ||
            res.serverError ||
            "Erro ao excluir agendamento."
        );
      }

      return res;
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["appointments"],
      });

      toast.success(
        "Agendamento excluído com sucesso!"
      );
    },

    onError: (error: Error) => {
      console.error(error);

      toast.error(
        error.message ||
          "Erro inesperado ao excluir agendamento."
      );
    },
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          disabled={mutation.isPending}
        >
          <Trash className="h-5 w-5 hover:text-red-500" />
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Deseja cancelar este agendamento?
          </AlertDialogTitle>

          <AlertDialogDescription>
            Essa ação não poderá ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={mutation.isPending}
          >
            Cancelar
          </AlertDialogCancel>

          <Button
            variant="destructive"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending
              ? "Excluindo..."
              : "Excluir"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}