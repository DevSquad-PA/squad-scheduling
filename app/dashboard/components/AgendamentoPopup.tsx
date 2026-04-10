"use client"

import { createAppointment } from "@/actions/create-booking"

import { useMutation } from "@tanstack/react-query"
import { useQuery } from "@tanstack/react-query"
import { getProfessionals } from "@/actions/get-professionals"
import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
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
import { getAvailableTime } from "@/actions/get-date-available-time"




const formSchema = z.object({
  nome: z.string().min(3, "Nome obrigatório"),
  cpf: z.string().min(11, "CPF inválido").max(11, "CPF inválido"),
  endereco: z.string().min(3, "Endereço obrigatório"),
  contato: z.string().min(11, "Telefone inválido").max(11, "Telefone inválido"),
  categoria: z.string().min(1, "Selecione o serviço"),
  servico: z.string().min(1, "Selecione ao menos um serviço"),
  especialista: z.string().min(1, "Selecione o especialista"),

  hora: z.string().min(1, "Selecione uma hora"),
  date: z.string().refine((date) => {
    const hoje = new Date().toISOString().split("T")[0]
    return date >= hoje
  }, {
    message: "Data não pode ser no passado"
  })
})

type FormSchema = z.infer<typeof formSchema>

function unmask(value: string) {
  return value.replace(/\D/g, "")
}

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


export function AgendamentoDialog() {
  const [categoria, setCategoria] = useState("")
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [especialistaId, setEspecialistaId] = useState("")
  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await createAppointment(data)

      // next-safe-action retorna isso
      if (res?.validationErrors) {
        throw new Error(res.validationErrors._errors?.[0] || "Erro")
      }

      return res
    },

    onSuccess: () => {
      console.log("Agendamento criado")

      form.reset()
      setCategoria("")
      setEspecialistaId("")

    },

    onError: (err: any) => {
      console.log("Erro:", err.message)
    },
  })

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      cpf: "",
      endereco: "",
      contato: "",
      categoria: "",
      servico: "",
      especialista: "",
      date: "",
      hora: "",
    },
  })



  const selectedDate = form.watch("date")

  useEffect(() => {
    form.setValue("hora", "")
  }, [selectedDate])

  useEffect(() => {
    carregarHorarios(selectedDate, especialistaId)
  }, [selectedDate, especialistaId])

  async function carregarHorarios(date: string, professionalId: string) {
    if (!date || !professionalId) return

    const [year, month, day] = date.split("-").map(Number)
    const parsedDate = new Date(year, month - 1, day)

    const res = await getAvailableTime({
      professionalId,
      date: parsedDate,
    })

    if (res?.data) {
      setAvailableTimes(res.data)
    }
  }

  const error = form.formState.errors

  const onSubmit = (data: FormSchema) => {

    const [year, month, day] = data.date.split("-").map(Number)
    const [hours, minutes] = data.hora.split(":").map(Number)
    const date = new Date(year, month - 1, day)
    const time = new Date(1970, 0, 1, hours, minutes)

    const selectedProfessional = professionals?.find(
      (p) => p.id === especialistaId
    )


    if (!professionals || !selectedProfessional) {
      console.log("Profissional não disponível")
      return
    }

    const mapped = {
      // ...data,
      clinicId: selectedProfessional?.clinicId,
      professionalId: selectedProfessional?.id,
      patientId: "0b010535-4581-42b1-be08-5b50d971b626",
      date: date,
      time: time,
      services: [data.servico],
    }
    console.log("agendadov:", mapped)
    mutation.mutate(mapped)
  }


  const { data: professionals, isLoading } = useQuery({
    queryKey: ["professionals"],
    queryFn: getProfessionals,
  })



  const categorias = Array.from(
    new Set(
      (professionals ?? [])
        .map((p) => p.specialty)
        .filter((s): s is string => !!s)
    )
  )

  const filteredProfessionals = (professionals ?? []).filter(
    (p) => p.specialty === categoria
  )


  return (
    <Dialog>
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

          <Input placeholder="Nome Completo" {...form.register("nome")} />
          {error.nome && (
            <span className="text-alert text-xs">{error.nome.message}</span>
          )}


          <Controller
            control={form.control}
            name="cpf"
            render={({ field }) => (
              <Input
                placeholder="CPF"
                value={formatCPF(field.value || "")}
                onChange={(e) => {
                  const raw = unmask(e.target.value).slice(0, 11)
                  field.onChange(raw)
                }}
              />
            )}
          />
          {error.cpf && (
            <span className="text-alert text-xs">{error.cpf.message}</span>
          )}

          <Input placeholder="Endereço" {...form.register("endereco")} />
          {error.endereco && (
            <span className="text-alert text-xs">
              {error.endereco.message}
            </span>
          )}

          <Controller
            control={form.control}
            name="contato"
            render={({ field }) => (
              <Input
                placeholder="Contato"
                value={formatTelefone(field.value || "")}
                onChange={(e) => {
                  const raw = unmask(e.target.value).slice(0, 11)
                  field.onChange(raw)
                }}
              />
            )}
          />
          {error.contato && (
            <span className="text-alert text-xs">
              {error.contato.message}
            </span>
          )}

          <Select
            value={categoria}
            onValueChange={(v) => {
              setCategoria(v)
              setEspecialistaId("")
              form.setValue("categoria", v)
              form.setValue("servico", "")
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Especialidade" />
            </SelectTrigger>

            <SelectContent>

              {isLoading && (
                <SelectItem value="loading">Carregando...</SelectItem>
              )}
              {!isLoading && categorias?.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}


            </SelectContent>
          </Select>
          {error.categoria && (
            <span className="text-alert text-xs">
              {error.categoria.message}
            </span>
          )}

          {categoria &&
            <Select
              value={especialistaId}
              onValueChange={(v) => {
                setEspecialistaId(v)
                form.setValue("especialista", v)
              }}
              disabled={!categoria}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Especialista" />
              </SelectTrigger>

              <SelectContent>
                {filteredProfessionals.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          }

          {especialistaId &&
            <>
              <Input type="date" {...form.register("date")} />
              {error.date && (
                <span className="text-alert text-xs">{error.date.message}</span>
              )}
            </>}

          {especialistaId && selectedDate && <>
            <Select
              value={form.watch("hora")}
              onValueChange={(v) => form.setValue("hora", v)}
              disabled={!availableTimes.length}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Horário disponível" />
              </SelectTrigger>

              <SelectContent>
                {availableTimes.length === 0 ? (
                  <SelectItem value="empty" disabled>
                    Nenhum horário disponível
                  </SelectItem>
                ) : (
                  availableTimes.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))
                )}

              </SelectContent>
            </Select>
            {error.hora && (
              <span className="text-alert text-xs">{error.hora.message}</span>
            )}
          </>
          }

          <Input placeholder="Serviço" {...form.register("servico")} />
          {error.servico && (
            <span className="text-alert text-xs">
              {error.servico.message}
            </span>
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