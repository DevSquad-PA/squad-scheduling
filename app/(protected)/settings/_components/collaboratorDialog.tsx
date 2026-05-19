"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import z from "zod";

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
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Colaboradores } from "@/types/collaborators/collaborator";

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

export default function CollaboratorDialog({
  onCreate,
  onUpdate,
  initial,
  trigger,
}: {
  onCreate?: (c: Colaboradores) => void;
  onUpdate?: (c: Colaboradores) => void;
  initial?: Colaboradores | null;
  trigger?: React.ReactNode;
}) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const isEdit = Boolean(initial);

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

  useEffect(() => {
    if (initial) {
      form.reset(initial as FormSchema);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial]);

  const contato = useWatch({
    control: form.control,
    name: "contato",
  });

  const error = form.formState.errors;

  const onSubmit = async (data: FormSchema) => {
    setSubmitting(true);
    try {
      if (isEdit) {
        // update flow
        console.log("Atualizando colaborador:", data);
        toast.success("Colaborador atualizado");
        if (onUpdate) onUpdate(data as Colaboradores);
      } else {
        // create flow
        console.log("Criando colaborador:", data);
        toast.success("Colaborador criado");
        if (onCreate) onCreate(data as Colaboradores);
      }
      form.reset();
      setOpen(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || (isEdit ? "Erro ao atualizar colaborador" : "Erro ao criar colaborador"));
    } finally {
      setSubmitting(false);
    }
  };

  const tipos = [
    { value: "admin", label: "Administrador" },
    { value: "user", label: "Usuário" },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="themegreen" className="w-fit" disabled={submitting} aria-busy={submitting}>
            {submitting ? (isEdit ? "Salvando..." : "Cadastrando...") : isEdit ? "Editar" : "+ Colaborador"}
          </Button>
        )}
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
            onValueChange={(v) => {
              form.setValue("tipo", v);
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
            <Button type="submit" variant="themegreen" disabled={submitting} aria-busy={submitting}>
              {submitting ? (isEdit ? "Salvando..." : "Cadastrando...") : isEdit ? "Salvar" : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
