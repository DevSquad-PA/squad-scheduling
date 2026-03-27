"use client"

import { Input } from "@/components/ui/input"
import SideBarAdmin from "./SideBarAdmin"
import { Search, ChevronLeft, ChevronRight, UserPen } from "lucide-react"
import { useState } from "react"

type Agendamento = {
  nome: string
  data: string
  hora: string
  descricao: string
}

const exemplo: Agendamento[] = [
  {
    nome: "José Maria da Silva",
    data: "27/03/2026",
    hora: "14:00",
    descricao: "Atendimento com dentista.",
  },
  {
    nome: "Lucas Fernandes Ribeiro",
    data: "27/03/2026",
    hora: "14:00",
    descricao: "Atendimento com dentista.",
  },
  {
    nome: "Maria Santana de Lopez",
    data: "28/03/2026",
    hora: "15:00",
    descricao: "Cirurgia com ortopedista.",
  },
]

export default function Admin() {
  const [search, setSearch] = useState("")
  const [dataAtual, setDataAtual] = useState(new Date())

  // FORMATA → "27/03/2026"
  function formatarData(date: Date) {
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  // FORMATO DO INPUT → "2026-03-27" (SEM BUG DE FUSO)
  function formatarParaInput(date: Date) {
    const ano = date.getFullYear()
    const mes = String(date.getMonth() + 1).padStart(2, "0")
    const dia = String(date.getDate()).padStart(2, "0")
    return `${ano}-${mes}-${dia}`
  }

  // STRING → DATE (correto)
  function parseData(data: string) {
    const [dia, mes, ano] = data.split("/")
    return new Date(Number(ano), Number(mes) - 1, Number(dia))
  }

  // INPUT → DATE
  function handleDataInput(value: string) {
    const [ano, mes, dia] = value.split("-")
    setDataAtual(new Date(Number(ano), Number(mes) - 1, Number(dia)))
  }

  // SETAS
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
    <SideBarAdmin>
      <div className="p-8 flex flex-col gap-4">
        <h2 className="font-bold text-base mb-2">Agendamentos</h2>

        {/* BUSCA */}
        <div className="relative w-fit">
          <Input
            placeholder="Pesquisar"
            className="w-80 pr-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-text2 w-4 h-4" />
        </div>

        {/* SELETOR DE DATA */}
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

        {/* LISTA */}
        {filtrados.length === 0 && (
          <p className="text-sm text-gray-500">
            Nenhum agendamento
          </p>
        )}

        {filtrados.map((e, i) => (
          <div
            key={i}
            className="grid grid-cols-[2fr_3fr_1.5fr_auto] gap-x-6 gap-y-1 py-2 items-center w-200"
          >
            <p className="truncate">{e.nome}</p>
            <p className="truncate">{e.descricao}</p>
            <p className="whitespace-nowrap">
              às {e.hora} horas
            </p>

            <button className="cursor-pointer">
              <UserPen className="hover:text-primary"/>
            </button>

            <span className="col-span-full h-px bg-text2"></span>
          </div>
        ))}
      </div>
    </SideBarAdmin>
  )
}