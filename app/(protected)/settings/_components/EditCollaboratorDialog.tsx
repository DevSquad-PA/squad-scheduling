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
  name: z.string().min(3, "Nome obrigatório"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(14, "Telefone inválido"),
  role: z.string().min(1, "Selecione o tipo"),
});

type FormSchema = z.infer<typeof formSchema>;
type CollaboratorRole = "Administrador" | "Atendimento" | "M\u00e9dico";

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
      name: collaborator.name,
      email: collaborator.email,
      phone: formatPhone(collaborator.phone),
      role: collaborator.role,
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset({
        name: collaborator.name,
        email: collaborator.email,
        phone: formatPhone(collaborator.phone),
        role: collaborator.role,
      });
    }
  }, [collaborator, form, open]);

  const phone = useWatch({
    control: form.control,
    name: "phone",
  });
  const role = useWatch({
    control: form.control,
    name: "role",
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
      nome: data.name,
      email: data.email,
      contato: data.phone,
      tipo: data.role as CollaboratorRole,
    });
  };

  const roles: Array<{ value: CollaboratorRole; label: string }> = [
    { value: "Administrador", label: "Administrador" },
    { value: "Atendimento", label: "Atendimento" },
    { value: "M\u00e9dico", label: "Médico" },
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
          <Input placeholder="Nome" {...form.register("name")} />
          {error.name && (
            <span className="text-alert text-xs">{error.name.message}</span>
          )}

          <Input placeholder="Email" {...form.register("email")} />
          {error.email && (
            <span className="text-alert text-xs">{error.email.message}</span>
          )}

          <Input
            placeholder="Contato"
            value={phone}
            onChange={(e) => {
              const formatted = formatPhone(e.target.value).slice(0, 15);
              form.setValue("phone", formatted, { shouldValidate: true });
            }}
          />
          {error.phone && (
            <span className="text-alert text-xs">{error.phone.message}</span>
          )}

          <Select
            value={role || undefined}
            onValueChange={(value) => {
              form.setValue("role", value, { shouldValidate: true });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tipo de usuário" />
            </SelectTrigger>

            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {error.role && (
            <span className="text-alert text-xs">{error.role.message}</span>
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
