"use client"

import { Input } from "@/components/ui/input"
import { Search, ChevronLeft, ChevronRight, UserPen } from "lucide-react"
import { useEffect, useState } from "react"
import { AgendamentoDialog } from "./components/AgendamentoPopup"

type Agendamento = {
  nome: string
  data: string
  hora: string
  descricao: string
}

export default function Dashboard() {
  const [search, setSearch] = useState("")
  const [dataAtual, setDataAtual] = useState(new Date())
  const [exemplo, setExemplo] = useState<Agendamento[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/appointments");
        if (!res.ok) return;
        const data = await res.json();
        // map API response to Agendamento shape
        const formatHora = (v: any) => {
          if (!v) return "";
          try {
            // ISO datetime like 1970-01-01T08:00:00.000Z
            if (typeof v === "string" && v.includes("T")) {
              const d = new Date(v);
              return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", hour12: false });
            }
            // time-only string like "08:00:00" or "08:00"
            if (typeof v === "string" && /^\d{2}:\d{2}(:\d{2})?$/.test(v)) {
              return v.split(":").slice(0, 2).join(":");
            }
            // Date object
            if (v instanceof Date) {
              return v.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", hour12: false });
            }
            // fallback
            const d = new Date(String(v));
            if (!Number.isNaN(d.getTime())) {
              return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", hour12: false });
            }
          } catch (e) {}
          return String(v).substring(0,5);
        };

        const mapped: Agendamento[] = data.map((a: any) => ({
          nome: a.patient_name || a.professional_name || "---",
          data: new Date(a.appointment_date).toLocaleDateString("pt-BR"),
          hora: formatHora(a.appointment_time),
          descricao: a.services ?? "",
        }));
        setExemplo(mapped);
      } catch (e) {
        // ignore for now
      }
    }

    load();
  }, []);


  function formatarData(date: Date) {
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  function formatarParaInput(date: Date) {
    const ano = date.getFullYear()
    const mes = String(date.getMonth() + 1).padStart(2, "0")
    const dia = String(date.getDate()).padStart(2, "0")
    return `${ano}-${mes}-${dia}`
  }


  function parseData(data: string) {
    const [dia, mes, ano] = data.split("/")
    return new Date(Number(ano), Number(mes) - 1, Number(dia))
  }


  function handleDataInput(value: string) {
    const [ano, mes, dia] = value.split("-")
    setDataAtual(new Date(Number(ano), Number(mes) - 1, Number(dia)))
  }

  function mudarDia(direcao: number) {
    setDataAtual((prev) => {
      const nova = new Date(prev)
      nova.setDate(nova.getDate() + direcao)
      return nova
    })
  }

  const filtrados = exemplo.filter((e) => {
    const matchData =
      formatarData(parseData(e.data)) === formatarData(dataAtual)

    const matchSearch =
      e.nome.toLowerCase().includes(search.toLowerCase()) ||
      e.descricao.toLowerCase().includes(search.toLowerCase())

    return matchData && matchSearch
  })

  return (

    <div className="p-8 flex flex-col gap-4">
      <h2 className="font-bold text-base mb-2">Agendamentos</h2>


      <div className="flex items-center gap-4">
        <AgendamentoDialog />

        <div className="relative w-fit">
          <Input
            placeholder="Pesquisar"
            className="w-80 pr-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-text2 w-4 h-4" />
        </div>
      </div>



      <div className="flex items-center gap-4 mt-4">

        <button onClick={() => mudarDia(-1)}>
          <ChevronLeft className="w-6 h-6 cursor-pointer" />
        </button>

        <input
          type="date"
          value={formatarParaInput(dataAtual)}
          onChange={(e) => handleDataInput(e.target.value)}
          className="border px-2 py-1 rounded"
        />

        <button onClick={() => mudarDia(1)}>
          <ChevronRight className="w-6 h-6 cursor-pointer" />
        </button>
      </div>

      {filtrados.length === 0 && (
        <p className="text-sm text-gray-500">
          Nenhum agendamento
        </p>
      )}

      {filtrados.map((e, i) => (
        <div
          key={i}
          className="grid grid-cols-[2fr_3fr_1.5fr_auto] gap-x-6 gap-y-1 py-2 items-center w-full"
        >
          <p className="truncate">{e.nome}</p>
          <p className="truncate">{e.descricao}</p>
          <p className="whitespace-nowrap">
            {e.data}{e.hora ? ` às ${e.hora}` : ""}
          </p>

          <button className="cursor-pointer">
            <UserPen className="hover:text-primary" />
          </button>

          <span className="col-span-full h-px bg-text2"></span>
        </div>
      ))}
    </div>

  )
}