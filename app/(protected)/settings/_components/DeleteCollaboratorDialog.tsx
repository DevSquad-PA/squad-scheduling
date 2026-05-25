"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";

import { deleteCollaborator } from "@/actions/collaboratorActions/delete-collaborator";
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
import { useToast } from "@/components/ui/toast";
import type { Collaborator } from "@/types/collaborators/collaborator";

type DeleteCollaboratorDialogProps = {
  collaborator: Collaborator;
};

export default function DeleteCollaboratorDialog({
  collaborator,
}: DeleteCollaboratorDialogProps) {
  const router = useRouter();
  const toast = useToast();

  const { execute, status } = useAction(deleteCollaborator, {
    onSuccess: () => {
      toast.success("Colaborador excluído");
      router.refresh();
    },
    onError: ({ error }) => {
      const validationMessage = error.validationErrors?._errors?.[0];

      if (validationMessage) {
        toast.error(validationMessage);
        return;
      }

      if (error.serverError) {
        toast.error(String(error.serverError));
        return;
      }

      toast.error("Erro ao excluir colaborador");
    },
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="icon" variant="ghost">
          <Trash2 className="h-5 w-5 hover:text-red-500" />
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir colaborador?</AlertDialogTitle>
          <AlertDialogDescription>
            {`Essa ação removerá ${collaborator.name} desta clínica.`}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={status === "executing"}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={status === "executing"}
            onClick={() => execute({ collaboratorId: collaborator.id })}
          >
            {status === "executing" ? "Excluindo..." : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
