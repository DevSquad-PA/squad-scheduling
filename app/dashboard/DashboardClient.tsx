"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight, UserPen } from "lucide-react";
import { AgendamentoDialog } from "./components/AgendamentoPopup";

type Agendamento = {
  nome: string;
  data: string;
  hora: string;
  descricao: string;
};

export default function DashboardClient({
  initial,
}: {
  initial: Agendamento[];
}) {
  const [search, setSearch] = useState("");
  const [dataAtual, setDataAtual] = useState(new Date());
  const [exemplo, setExemplo] = useState<Agendamento[]>(initial || []);

  useEffect(() => {
    setExemplo(initial || []);
  }, [initial]);

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

  const filtrados = exemplo.filter((e) => {
    const matchData =
      formatarData(parseData(e.data)) === formatarData(dataAtual);

    const matchSearch =
      e.nome.toLowerCase().includes(search.toLowerCase()) ||
      e.descricao.toLowerCase().includes(search.toLowerCase());

    return matchData && matchSearch;
  });

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

      {filtrados.length === 0 && (
        <p className="text-sm text-gray-500">Nenhum agendamento</p>
      )}

      {filtrados.map((e, i) => (
        <div
          key={i}
          className="grid w-full grid-cols-[2fr_3fr_1.5fr_auto] items-center gap-x-6 gap-y-1 py-2"
        >
          <p className="truncate">{e.nome}</p>
          <p className="truncate">{e.descricao}</p>
          <p className="whitespace-nowrap">
            {e.data}
            {e.hora ? ` às ${e.hora}` : ""}
          </p>

          <button className="cursor-pointer">
            <UserPen className="hover:text-primary" />
          </button>

          <span className="bg-text2 col-span-full h-px"></span>
        </div>
      ))}
    </div>
  );
}
