"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import z from "zod";

import { createAppointment } from "@/actions/bookingActions/create-booking";
import { getAvailableTime } from "@/actions/get-date-available-time";
import { getPatientsWithBookings } from "@/actions/get-patients-with-bookings";
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
import { getProfessionalsByClinic } from "@/data/professional";
import type { PatientWithBookings } from "@/types/patient/patient";

const formSchema = z.object({
  nome: z.string().min(3, "Nome obrigatório"),
  cpf: z.string().min(11, "CPF inválido").max(11, "CPF inválido"),
  endereco: z.string().min(3, "Endereço obrigatório"),
  contato: z.string().min(11, "Telefone inválido").max(11, "Telefone inválido"),
  categoria: z.string().min(1, "Selecione o serviço"),
  servico: z.string().min(1, "Selecione ao menos um serviço"),
  especialista: z.string().min(1, "Selecione o especialista"),

  hora: z.string().min(1, "Selecione uma hora"),
  date: z.string().refine(
    (date) => {
      const hoje = new Date().toISOString().split("T")[0];
      return date >= hoje;
    },
    {
      message: "Data não pode ser no passado",
    },
  ),
});

type FormSchema = z.infer<typeof formSchema>;

type CreateAppointmentInput = {
  clinicId: string;
  professionalId: string;
  patientId?: string;
  patient?: {
    name: string;
    cpf: string;
    phone: string;
    address: string;
  };
  date: string;
  time: string;
  services: string[];
};

function unmask(value: string) {
  return value.replace(/\D/g, "");
}

function formatCPF(value: string) {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function formatTelefone(value: string) {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

export default function AppointmentsDialog({ clinicId }: { clinicId: string }) {
  const [categoria, setCategoria] = useState("");
  const [isNewClient, setIsNewClient] = useState(true);
  const [selectedPatientId, setSelectedPatientId] = useState<
    string | undefined
  >(undefined);
  const [especialistaId, setEspecialistaId] = useState("");
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
  });

  const toast = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: CreateAppointmentInput) => {
      const res = await createAppointment(data);

      // next-safe-action retorna isso
      if (res?.validationErrors) {
        throw new Error(res.validationErrors._errors?.[0] || "Erro");
      }

      return res;
    },
    onSuccess: (created) => {
      console.log("Agendamento criado (response):", created);
      toast.success("Agendamento criado");
      form.reset();
      setCategoria("");
      setEspecialistaId("");
      queryClient.invalidateQueries({ queryKey: ["appointments", clinicId] });
    },

    onError: (err: Error) => {
      console.error("Erro ao criar agendamento:", err);
      const msg = err.message || "Erro ao criar agendamento";
      toast.error("Erro", msg);
    },
  });

  const selectedDate = useWatch({
    control: form.control,
    name: "date",
  });
  const selectedTime = useWatch({
    control: form.control,
    name: "hora",
  });

  const { data: availableTimes = [] } = useQuery<string[]>({
    queryKey: ["availableTimes", especialistaId, selectedDate],
    enabled: Boolean(selectedDate && especialistaId),
    queryFn: async () => {
      const [year, month, day] = selectedDate.split("-").map(Number);
      const parsedDate = new Date(year, month - 1, day);

      const res = await getAvailableTime({
        professionalId: especialistaId,
        date: parsedDate,
      });

      return res?.data ?? [];
    },
  });

  useEffect(() => {
    form.setValue("hora", "");
  }, [form, selectedDate]);

  const error = form.formState.errors;

  const onSubmit = (data: FormSchema) => {
    // send date and time as strings to server for consistent parsing
    const date = data.date; // "YYYY-MM-DD"
    const time = data.hora; // "HH:mm"

    if (isNewClient) {
      const patientWithSameCpf = patients.find((patient) => patient.cpf === data.cpf);

      if (patientWithSameCpf) {
        form.setError("cpf", {
          type: "validate",
          message: "CPF ja cadastrado. Selecione o cliente existente.",
        });
        toast.error("CPF ja cadastrado", "Selecione o cliente existente para agendar.");
        return;
      }
    }

    const selectedProfessional = professionals?.find(
      (p) => p.id === especialistaId,
    );

    if (!professionals || !selectedProfessional) {
      console.log("Profissional não disponível");
      return;
    }

    const mapped: CreateAppointmentInput = {
      clinicId,
      professionalId: selectedProfessional.id,
      date: date,
      time: time,
      services: [data.servico],
    };

    if (!isNewClient) {
      if (!selectedPatientId) {
        console.log("Selecione um cliente existente");
        return;
      }
      mapped.patientId = selectedPatientId;
    } else {
      mapped.patient = {
        name: data.nome,
        cpf: data.cpf,
        phone: data.contato,
        address: data.endereco,
      };
    }

    console.log("agendadov:", mapped);
    mutation.mutate(mapped);
  };

  const { data: professionals = [], isLoading } = useQuery({
    queryKey: ["professionals", clinicId],
    queryFn: () => getProfessionalsByClinic(clinicId),
  });

  const { data: patients = [] } = useQuery<PatientWithBookings[]>({
    queryKey: ["patientsWithBookings", clinicId],
    queryFn: async () => {
      const res = await getPatientsWithBookings({ clinicId });
      return res?.data ?? [];
    },
  });

  const categorias = Array.from(
    new Set(
      (professionals ?? [])
        .map((p) => p.specialty)
        .filter((s): s is string => !!s),
    ),
  );

  const filteredProfessionals = (professionals ?? []).filter(
    (p) => p.specialty === categoria,
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="themegreen" className="w-fit">
          + Agendar
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Agendamento</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-2"
        >
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="clientType"
                checked={isNewClient}
                onChange={() => {
                  setIsNewClient(true);
                  setSelectedPatientId(undefined);
                  form.setValue("nome", "");
                  form.setValue("cpf", "");
                  form.setValue("endereco", "");
                  form.setValue("contato", "");
                }}
              />
              <span>Novo cliente</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="clientType"
                checked={!isNewClient}
                onChange={() => {
                  setIsNewClient(false);
                }}
              />
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
                      const raw = unmask(e.target.value).slice(0, 11);
                      field.onChange(raw);
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
                      const raw = unmask(e.target.value).slice(0, 11);
                      field.onChange(raw);
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
                  setSelectedPatientId(v);
                  const p = patients.find((p) => p.id === v);
                  form.setValue("nome", p?.firstName ?? "");
                  form.setValue("cpf", p?.cpf ?? "");
                  form.setValue("endereco", p?.addressNumber ?? "");
                  form.setValue("contato", p?.phone ?? "");
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecionar cliente" />
                </SelectTrigger>

                <SelectContent>
                  {patients.length === 0 ? (
                    <SelectItem value="empty" disabled>
                      Nenhum cliente cadastrado
                    </SelectItem>
                  ) : (
                    patients.map((p) => (
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
              setCategoria(v);
              setEspecialistaId("");
              form.setValue("categoria", v);
              form.setValue("servico", "");
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Especialidade" />
            </SelectTrigger>

            <SelectContent>
              {isLoading && (
                <SelectItem value="loading">Carregando...</SelectItem>
              )}
              {!isLoading &&
                categorias?.map((c) => (
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

          {categoria && (
            <Select
              value={especialistaId}
              onValueChange={(v) => {
                setEspecialistaId(v);
                form.setValue("especialista", v);
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
          )}

          {especialistaId && (
            <>
              <Input type="date" {...form.register("date")} />
              {error.date && (
                <span className="text-alert text-xs">{error.date.message}</span>
              )}
            </>
          )}

          {especialistaId && selectedDate && (
            <>
              <Select
                value={selectedTime}
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
          )}

          <Input placeholder="Serviço" {...form.register("servico")} />
          {error.servico && (
            <span className="text-alert text-xs">{error.servico.message}</span>
          )}

          <DialogFooter>
            <Button
              type="submit"
              variant="themegreen"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Agendando..." : "Agendar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
