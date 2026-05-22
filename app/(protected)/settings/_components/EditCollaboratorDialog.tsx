"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { UserPen } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import z from "zod";

import { updateCollaborator } from "@/actions/collaboratorActions/update-collaborator";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { formatPhone } from "@/lib/utils";
import type { Collaborator } from "@/types/collaborators/collaborator";

const formSchema = z.object({
  nome: z.string().min(3, "Nome obrigatório"),
  email: z.string().email("Email inválido"),
  contato: z.string().min(14, "Telefone inválido"),
  tipo: z.string().min(1, "Selecione o tipo"),
});

type FormSchema = z.infer<typeof formSchema>;

type EditCollaboratorDialogProps = {
  collaborator: Collaborator;
};

export default function EditCollaboratorDialog({
  collaborator,
}: EditCollaboratorDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: collaborator.nome,
      email: collaborator.email,
      contato: formatPhone(collaborator.contato),
      tipo: collaborator.tipo,
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset({
        nome: collaborator.nome,
        email: collaborator.email,
        contato: formatPhone(collaborator.contato),
        tipo: collaborator.tipo,
      });
    }
  }, [collaborator, form, open]);

  const contato = useWatch({
    control: form.control,
    name: "contato",
  });
  const tipo = useWatch({
    control: form.control,
    name: "tipo",
  });

  const error = form.formState.errors;

  const { execute, status } = useAction(updateCollaborator, {
    onSuccess: () => {
      toast.success("Colaborador atualizado");
      setOpen(false);
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

      toast.error("Erro ao atualizar colaborador");
    },
  });

  const onSubmit = (data: FormSchema) => {
    execute({
      collaboratorId: collaborator.id,
      ...data,
      tipo: data.tipo as "Administrador" | "Atendimento" | "Médico",
    });
  };

  const tipos = [
    { value: "Administrador", label: "Administrador" },
    { value: "Atendimento", label: "Atendimento" },
    { value: "Médico", label: "Médico" },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost">
          <UserPen className="h-5 w-5 hover:text-primary" />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar colaborador</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-2"
        >
          <Input placeholder="Nome" {...form.register("nome")} />
          {error.nome && (
            <span className="text-alert text-xs">{error.nome.message}</span>
          )}

          <Input placeholder="Email" {...form.register("email")} />
          {error.email && (
            <span className="text-alert text-xs">{error.email.message}</span>
          )}

          <Input
            placeholder="Contato"
            value={contato}
            onChange={(e) => {
              const formatted = formatPhone(e.target.value).slice(0, 15);
              form.setValue("contato", formatted, { shouldValidate: true });
            }}
          />
          {error.contato && (
            <span className="text-alert text-xs">{error.contato.message}</span>
          )}

          <Select
            value={tipo || undefined}
            onValueChange={(v) => {
              form.setValue("tipo", v, { shouldValidate: true });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tipo de usuário" />
            </SelectTrigger>

            <SelectContent>
              {tipos.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {error.tipo && (
            <span className="text-alert text-xs">{error.tipo.message}</span>
          )}

          <DialogFooter>
            <Button
              type="submit"
              variant="themegreen"
              disabled={status === "executing"}
            >
              {status === "executing" ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
