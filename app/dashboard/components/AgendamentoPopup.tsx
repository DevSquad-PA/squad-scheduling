"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import { useAction } from "next-safe-action/hooks"
import { useRouter } from "next/navigation"
import { createAppointment } from "@/actions/create-booking"

// =======================
// ✅ ZOD
// =======================
const formSchema = z.object({
  nome: z.string().min(3, "Nome obrigatório"),
  cpf: z.string().min(14, "CPF inválido"),
  endereco: z.string().min(3, "Endereço obrigatório"),
  contato: z.string().min(14, "Telefone inválido"),
  servico: z.string().min(1, "Selecione o serviço"),
  especialista: z.string().min(1, "Selecione o especialista"),
  data: z.string().min(1, "Selecione a data"),
  hora: z.string().min(1, "Selecione a hora"),
})

type FormSchema = z.infer<typeof formSchema>

// =======================
// ✅ MÁSCARAS
// =======================
function formatCPF(value: string) {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
}

function formatTelefone(value: string) {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
}

// =======================
// COMPONENTE
// =======================
type Agendamento = {
  nome: string
  data: string
  hora: string
  descricao: string
}

export function AgendamentoDialog({ onCreate }: { onCreate?: (a: Agendamento) => void }) {
  const [servico, setServico] = useState("")
  const [especialista, setEspecialista] = useState("")
  const [open, setOpen] = useState(false)

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      cpf: "",
      endereco: "",
      contato: "",
      servico: "",
      especialista: "",
      data: "",
      hora: "",
    },
  })

  const error = form.formState.errors

  const { execute, status } = useAction(createAppointment, {
    onSuccess: (result) => {
      if (result?.data?.appointment) {
        if (onCreate) onCreate(result.data.appointment)
      }
      try {
        router.refresh()
      } catch (e) {}
      setOpen(false)
      form.reset()
    },
    onError: ({ error }) => {
      console.error('Erro criando agendamento (action):', error)
      alert((error as any)?.serverError || 'Erro ao criar agendamento')
    }
  })

  const onSubmit = (data: FormSchema) => {
    execute({
      professionalId: undefined,
      patient: {
        nome: data.nome,
        cpf: data.cpf,
        endereco: data.endereco,
        contato: data.contato,
      },
      date: data.data,
      time: data.hora,
      services: [data.servico],
    })
  }

  const servicos = [
    { value: "dentista", label: "Dentista" },
    { value: "ortopedista", label: "Ortopedista" },
  ]

  const especialistas: Record<string, any[]> = {
    dentista: [{ value: "jose", label: "Dr. José" }],
    ortopedista: [{ value: "carlos", label: "Dr. Carlos" }],
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="themegreen" className="w-fit">+ Agendar</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Agendamento</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-2"
        >
          {/* NOME */}
          <Input placeholder="Nome Completo" {...form.register("nome")} />
          {error.nome && (
            <span className="text-alert text-xs">{error.nome.message}</span>
          )}

          {/* CPF */}
          <Input
            placeholder="CPF"
            value={form.watch("cpf")}
            onChange={(e) => {
              const formatted = formatCPF(e.target.value).slice(0, 14)
              form.setValue("cpf", formatted)
            }}
          />
          {error.cpf && (
            <span className="text-alert text-xs">{error.cpf.message}</span>
          )}

          {/* ENDEREÇO */}
          <Input placeholder="Endereço" {...form.register("endereco")} />
          {error.endereco && (
            <span className="text-alert text-xs">
              {error.endereco.message}
            </span>
          )}

          {/* TELEFONE */}
          <Input
            placeholder="Contato"
            value={form.watch("contato")}
            onChange={(e) => {
              const formatted = formatTelefone(e.target.value).slice(0, 15)
              form.setValue("contato", formatted)
            }}
          />
          {error.contato && (
            <span className="text-alert text-xs">
              {error.contato.message}
            </span>
          )}

          {/* SERVIÇO */}
          <Select
            onValueChange={(v) => {
              setServico(v)
              setEspecialista("")
              form.setValue("servico", v)
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Serviço" />
            </SelectTrigger>

            <SelectContent>
              {servicos.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {error.servico && (
            <span className="text-alert text-xs">
              {error.servico.message}
            </span>
          )}

          {/* ESPECIALISTA */}
          <Select
            value={especialista}
            onValueChange={(v) => {
              setEspecialista(v)
              form.setValue("especialista", v)
            }}
            disabled={!servico}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Especialista" />
            </SelectTrigger>

            <SelectContent>
              {(especialistas[servico] || []).map((e) => (
                <SelectItem key={e.value} value={e.value}>
                  {e.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {error.especialista && (
            <span className="text-alert text-xs">
              {error.especialista.message}
            </span>
          )}

          {/* DATA */}
          <Input type="date" {...form.register("data")} />
          {error.data && (
            <span className="text-alert text-xs">{error.data.message}</span>
          )}

          {/* HORA */}
          <Input type="time" {...form.register("hora")} />
          {error.hora && (
            <span className="text-alert text-xs">{error.hora.message}</span>
          )}

          <DialogFooter>
            <Button type="submit" variant="themegreen">
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}