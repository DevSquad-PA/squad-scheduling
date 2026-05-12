"use client"

import { createAppointment } from "@/actions/create-booking"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useQuery } from "@tanstack/react-query"
import { getProfessionalsByClinic } from "@/data/professional"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
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
import { getPatientsWithBookings } from "@/actions/get-patients-with-bookings"




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


export default function AgendamentoDialog() {
  const [categoria, setCategoria] = useState("")
  const [isNewClient, setIsNewClient] = useState(true)
  const [selectedPatientId, setSelectedPatientId] = useState<string | undefined>(undefined)
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [especialistaId, setEspecialistaId] = useState("")
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

  const queryClient = useQueryClient()
  const toast = useToast()
  const router = useRouter()

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await createAppointment(data)

      // next-safe-action retorna isso
      if (res?.validationErrors) {
        throw new Error(res.validationErrors._errors?.[0] || "Erro")
      }

      return res
    },
    onSuccess: (created) => {
      console.log("Agendamento criado (response):", created)
      toast.success("Agendamento criado")
      form.reset()
      setCategoria("")
      setEspecialistaId("")
      router.refresh()
    },

    onError: (err: any) => {
      console.error("Erro ao criar agendamento:", err)
      const msg = err?.message || "Erro ao criar agendamento"
      toast.error("Erro", msg)
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
    // send date and time as strings to server for consistent parsing
    const date = data.date // "YYYY-MM-DD"
    const time = data.hora // "HH:mm"

    const selectedProfessional = professionals?.find(
      (p) => p.id === especialistaId
    )


    if (!professionals || !selectedProfessional) {
      console.log("Profissional não disponível")
      return
    }

    const mapped: any = {
      clinicId: selectedProfessional?.clinicId,
      professionalId: selectedProfessional?.id,
      date: date,
      time: time,
      services: [data.servico],
    }

    if (!isNewClient) {
      if (!selectedPatientId) {
        console.log("Selecione um cliente existente")
        return
      }
      mapped.patientId = selectedPatientId
    } else {
      mapped.patient = {
        name: data.nome,
        cpf: data.cpf,
        phone: data.contato,
        address: data.endereco,
      }
    }

    console.log("agendadov:", mapped)
    mutation.mutate(mapped)
  }

  const clinicId = "00958c6b-316b-4b1d-9b17-b08d7ca60fc9" 

  const { data: professionals = [], isLoading } = useQuery({
    queryKey: ["professionals", clinicId],
    queryFn: () => getProfessionalsByClinic(clinicId),
  })

  const { data: patients = [] } = useQuery({
    queryKey: ["patientsWithBookings", clinicId],
    queryFn: async () => {
      const res = await getPatientsWithBookings({ clinicId })
      return res?.data ?? []
    },
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

          <div className="flex gap-4 items-center">
            <label className="flex items-center gap-2">
              <input type="radio" name="clientType" checked={isNewClient} onChange={() => { setIsNewClient(true); setSelectedPatientId(undefined); form.setValue("nome", ""); form.setValue("cpf", ""); form.setValue("endereco", ""); form.setValue("contato", "") }} />
              <span>Novo cliente</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="clientType" checked={!isNewClient} onChange={() => { setIsNewClient(false); }} />
              <span>Cliente existente</span>
            </label>
          </div>

          {isNewClient ? (
            <>
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
            </>
          ) : (
            <>
              <Select
                value={selectedPatientId}
                onValueChange={(v) => {
                  setSelectedPatientId(v)
                  const p = patients.find((p: any) => p.id === v)
                  form.setValue("nome", p?.firstName ?? "")
                  form.setValue("cpf", p?.cpf ?? "")
                  form.setValue("endereco", p?.addressNumber ?? "")
                  form.setValue("contato", p?.phone ?? "")
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecionar cliente" />
                </SelectTrigger>

                <SelectContent>
                  {patients.length === 0 ? (
                    <SelectItem value="empty" disabled>Nenhum cliente com agendamento</SelectItem>
                  ) : (
                    patients.map((p: any) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.firstName} {p.lastName ?? ""} - {p.phone ?? p.cpf}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </>
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
                    {p.user?.name}
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