"use client";

import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { PropsAppointment } from "@/types/appointment/appointments";

import AppointmentsDialog from "./AppointmentsDialog";

export default function AppointmentsClient({
  initial,
}: {
  initial: PropsAppointment[];
}) {
  const [search, setSearch] = useState("");
  const [dataAtual, setDataAtual] = useState(new Date());
  const appointments = initial || [];

  function formatarParaInput(date: Date) {
    const ano = date.getFullYear();
    const mes = String(date.getMonth() + 1).padStart(2, "0");
    const dia = String(date.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
  }

  function parseData(data: string) {
    const [dia, mes, ano] = data.split("/");
    return new Date(Number(ano), Number(mes) - 1, Number(dia));
  }

  function handleDataInput(value: string) {
    const [ano, mes, dia] = value.split("-");
    setDataAtual(new Date(Number(ano), Number(mes) - 1, Number(dia)));
  }

  function mudarDia(direcao: number) {
    setDataAtual((prev) => {
      const nova = new Date(prev);
      nova.setDate(nova.getDate() + direcao);
      return nova;
    });
  }

  function mesmaData(d1: Date | string, d2: Date) {
    const dateA = new Date(d1 instanceof Date ? d1 : new Date(d1));
    const dateB = new Date(d2 instanceof Date ? d2 : new Date(d2));
    return (
      dateA.getFullYear() === dateB.getFullYear() &&
      dateA.getMonth() === dateB.getMonth() &&
      dateA.getDate() === dateB.getDate()
    );
  }

  const filtrados = appointments.filter((a: PropsAppointment) => {
    const matchData = mesmaData(parseData(a.data), dataAtual);

    const matchSearch =
      a.nome.toLowerCase().includes(search.toLowerCase()) ||
      a.descricao.toLowerCase().includes(search.toLowerCase());

    return matchData && matchSearch;
  });

  return (
    <div className="flex flex-col gap-4 p-8">
      <h2 className="mb-2 text-base font-bold">Agendamentos</h2>

      <div className="flex items-center gap-4">
        <AppointmentsDialog />

        <div className="relative w-fit">
          <Input
            placeholder="Pesquisar"
            className="w-80 pr-10"
            value={search}
            onChange={(e) => setSearch((e.target as HTMLInputElement).value)}
          />
          <Search className="text-text2 absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <button onClick={() => mudarDia(-1)}>
          <ChevronLeft className="h-6 w-6 cursor-pointer" />
        </button>

        <input
          type="date"
          value={formatarParaInput(dataAtual)}
          onChange={(e) =>
            handleDataInput((e.target as HTMLInputElement).value)
          }
          className="rounded border px-2 py-1"
        />

        <button onClick={() => mudarDia(1)}>
          <ChevronRight className="h-6 w-6 cursor-pointer" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {filtrados.map((e, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle>{e.nome ?? "—"}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1 text-sm">
              <p>
                <strong>Serviço:</strong> {e.descricao ?? "—"}
              </p>
              <p>
                <strong>Hora:</strong> {e.hora ?? "N/A"}
              </p>
              <p>
                <strong>Cliente:</strong> {e.cliente ?? "N/A"}
              </p>
              <p>
                <strong>Contato:</strong> {e.contato ?? "N/A"}
              </p>
              <p>
                <strong>CPF:</strong> {e.cpf ?? "N/A"}
              </p>
              <p>
                <strong>Endereço:</strong> {e.endereco ?? "N/A"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtrados.length === 0 && (
        <p className="text-sm text-gray-500">Nenhum agendamento</p>
      )}
    </div>
  );
}
