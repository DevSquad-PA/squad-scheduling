"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import z from "zod";

import { createCollaborator } from "@/actions/collaboratorActions/create-collaborator";
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

const formSchema = z.object({
  nome: z.string().min(3, "Nome obrigatório"),
  usuario: z.string().min(3, "Usuário obrigatório"),
  email: z.string().email("Email inválido"),
  senha: z.string().min(6, "Senha mínima 6 caracteres"),
  contato: z.string().min(14, "Telefone inválido"),
  tipo: z.string().min(1, "Selecione o tipo"),
});

type FormSchema = z.infer<typeof formSchema>;

function formatTelefone(value: string) {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

export default function CollaboratorDialog() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      usuario: "",
      email: "",
      senha: "",
      contato: "",
      tipo: "",
    },
  });

  const contato = useWatch({
    control: form.control,
    name: "contato",
  });
  const tipo = useWatch({
    control: form.control,
    name: "tipo",
  });

  const error = form.formState.errors;

  const { execute, status } = useAction(createCollaborator, {
    onSuccess: () => {
      toast.success("Colaborador criado");
      form.reset();
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

      toast.error("Erro ao criar colaborador");
    },
  });

  const onSubmit = (data: FormSchema) => {
    execute({
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
        <Button variant="themegreen" className="w-fit">
          + Colaborador
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Colaborador</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-2"
        >
          <Input placeholder="Nome" {...form.register("nome")} />
          {error.nome && (
            <span className="text-alert text-xs">{error.nome.message}</span>
          )}

          <Input placeholder="Usuário" {...form.register("usuario")} />
          {error.usuario && (
            <span className="text-alert text-xs">{error.usuario.message}</span>
          )}

          <Input placeholder="Email" {...form.register("email")} />
          {error.email && (
            <span className="text-alert text-xs">{error.email.message}</span>
          )}

          <Input
            type="password"
            placeholder="Senha"
            {...form.register("senha")}
          />
          {error.senha && (
            <span className="text-alert text-xs">{error.senha.message}</span>
          )}

          <Input
            placeholder="Contato"
            value={contato}
            onChange={(e) => {
              const formatted = formatTelefone(e.target.value).slice(0, 15);
              form.setValue("contato", formatted);
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
