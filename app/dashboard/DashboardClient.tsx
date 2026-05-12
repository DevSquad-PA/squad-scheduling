"use client";

import { ChevronLeft, ChevronRight,Search } from "lucide-react";
import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import AgendamentoDialog from "./components/AgendamentoDialog";

type propsappointment = {
  nome: string;
  data: string;
  hora: string;
  descricao: string;
  cliente: string;
  endereco: string;
  contato: string;
  cpf: string;
  email: string;
};

export default function DashboardClient({
  initial,
}: {
  initial: propsappointment[];
}) {
  const [search, setSearch] = useState("");
  const [dataAtual, setDataAtual] = useState(new Date());
  const appointments = initial || [];

  function formatarData(date: Date) {
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

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
    const dateA = new Date(d1 instanceof Date ? d1 : new Date(d1))
    const dateB = new Date(d2 instanceof Date ? d2 : new Date(d2))
    return (
      dateA.getFullYear() === dateB.getFullYear() &&
      dateA.getMonth() === dateB.getMonth() &&
      dateA.getDate() === dateB.getDate()
    )
  }




  const filtrados = appointments.filter((a: propsappointment) => {
    
    const matchData = mesmaData(parseData(a.data), dataAtual)

    const matchSearch =
      a.nome.toLowerCase().includes(search.toLowerCase()) ||
      a.descricao.toLowerCase().includes(search.toLowerCase());

    return matchData && matchSearch
  })


  return (
    <div className="flex flex-col gap-4 p-8">
      <h2 className="mb-2 text-base font-bold">Agendamentos</h2>

      <div className="flex items-center gap-4">
        <AgendamentoDialog />

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



      {/* {filtrados.length > 0 &&
        <div className="grid grid-cols-[2fr_2fr_1fr_1fr] gap-x-6 py-2 font-bold">
          <p>Profissional</p>
          <p>Serviço</p>
          <p>Hora</p>
          <p>Cliente</p>
        </div>
      } */}


      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">

        {filtrados.map((e, i) => (

          <Card key={i}>
            <CardHeader>
              <CardTitle>{e.nome ?? "—"}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1 text-sm">
              <p><strong>Serviço:</strong> {e.descricao ?? "—"}</p>
              <p><strong>Hora:</strong> {e.hora ?? "N/A"}</p>
              <p><strong>Cliente:</strong> {e.cliente ?? "N/A"}</p>
              <p><strong>Contato:</strong> {e.contato ?? "N/A"}</p>
              <p><strong>CPF:</strong> {e.cpf ?? "N/A"}</p>
              <p><strong>Endereço:</strong> {e.endereco ?? "N/A"}</p>
            </CardContent>
          </Card>



          // <div
          //   key={i}
          //   className="grid w-full grid-cols-[2fr_2fr_1fr_1fr] items-center gap-x-6 gap-y-1 py-2 hover:text-primary cursor-pointer"
          // >
          //   <p className="truncate">{e.nome}</p>
          //   <p className="truncate">{e.descricao}</p>
          //   <p className="whitespace-nowrap">{e.hora}</p>
          //   <p>{e.cliente}</p>
          //   <span className="bg-text2 col-span-full h-px"></span>
          // </div>
        ))}

      </div>

      {filtrados.length === 0 && (
        <p className="text-sm text-gray-500">Nenhum agendamento</p>
      )}

    </div>

  );
}