"use client"

import { Input } from "@/components/ui/input"
import { Search, ChevronLeft, ChevronRight, UserPen } from "lucide-react"
import { useState } from "react"
import { AgendamentoDialog } from "./components/AgendamentoPopup"
import { useQuery } from "@tanstack/react-query"
import { getAppointments } from "@/actions/getAppointments"

type propsappointment = {
  id: string
  date: Date
  time: Date
  services: string[]
  patient: {
    user: {
      name: string
    }
  }
  professional: {
    user: {
      name: string
    }
  }
}

export default function Dashboard() {
  const [search, setSearch] = useState("")
  const [dataAtual, setDataAtual] = useState(new Date())

  const { data: appointments = [] } = useQuery({
    queryKey: ["appointments"],
    queryFn: getAppointments,
  })

  // ✅ DATA COM TIMEZONE FIXO
  function formatarData(date: Date | string) {
    return new Date(date).toLocaleDateString("pt-BR", {
      timeZone: "America/Sao_Paulo",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  // ✅ HORA SEGURA
  function formatarHora(time: Date | string) {
    const d = new Date(time)

    return new Date(1970, 0, 1, d.getHours(), d.getMinutes())
      .toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      })
  }

  // ✅ COMPARAÇÃO DE DATA CORRETA
  function mesmaData(d1: Date | string, d2: Date) {
    return (
      new Date(d1).toLocaleDateString("pt-BR", {
        timeZone: "America/Sao_Paulo",
      }) ===
      new Date(d2).toLocaleDateString("pt-BR", {
        timeZone: "America/Sao_Paulo",
      })
    )
  }

  function formatarParaInput(date: Date) {
    const ano = date.getFullYear()
    const mes = String(date.getMonth() + 1).padStart(2, "0")
    const dia = String(date.getDate()).padStart(2, "0")
    return `${ano}-${mes}-${dia}`
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

  const filtrados = appointments.filter((a: propsappointment) => {
    const matchData = mesmaData(a.date, dataAtual)

    const matchSearch =
      a.patient.user.name.toLowerCase().includes(search.toLowerCase()) ||
      a.services.join(", ").toLowerCase().includes(search.toLowerCase())

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
        <p className="text-sm text-gray-500">Nenhum agendamento</p>
      )}

      <div className="grid grid-cols-[2fr_2fr_2fr_1fr_1fr_1fr_auto] gap-x-6 py-2 font-bold">
        <p>Nome</p>
        <p>Serviço</p>
        <p>Profissional</p>
        <p>Data</p>
        <p>Hora</p>
      </div>

      {filtrados.map((a) => (
        <div
          className="grid grid-cols-[2fr_2fr_2fr_1fr_1fr_1fr_auto] gap-x-6 py-2 items-center"
          key={a.id}
        >
          <p>{a.patient.user.name}</p>

          <p>{a.services.join(", ")}</p>

          <p>{a.professional.user.name}</p>

          <p>{formatarData(a.date)}</p>

          <p>às {formatarHora(a.time)}</p>

          <button className="cursor-pointer">
            <UserPen className="hover:text-primary" />
          </button>

          <span className="border-b border-text2 col-span-full" />
        </div>
      ))}
    </div>
  )
}