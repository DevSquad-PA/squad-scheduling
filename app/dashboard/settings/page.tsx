"use client"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserPen } from "lucide-react";
import AgendamentoDialog from "../components/AgendamentoDialog";
import { useState } from "react";
import ColaboradorDialog from "../components/ColaboradorDialog";

export default function Settings () {

    type Colaboradores = {
  nome: string
  usuario: string
  email: string
  senha: string
  contato: string
  tipo: string
}

const [search, setSearch] = useState("")

     const exemplo: Colaboradores[] = [
    {
      nome: "João Fernando da lima",
      usuario: "myuser",
      email: "user@email.com",
      senha: "mypassword.",
      contato: "(DDD) 0000-0000",
      tipo: "Administrador",
    },
    {
      nome: "João Fernando da lima",
      usuario: "myuser",
      email: "user@email.com",
      senha: "mypassword.",
      contato: "(DDD) 0000-0000",
      tipo: "Usuário",
    },
  ]

    return(<div className="p-8 flex flex-col gap-4">
    <h2 className="font-bold text-base mb-2">Configurações</h2>
     <div className="flex items-center gap-4">
            <ColaboradorDialog />
    
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
    
    

    
          {exemplo.length === 0 && (
            <p className="text-sm text-gray-500">
              Nenhum agendamento
            </p>
          )}
    
          {exemplo.map((e, i) => (
            <div
              key={i}
              className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_auto] gap-x-6 gap-y-1 py-2 items-center w-full">
              <p className="truncate">{e.nome}</p>
              <p className="truncate">{e.tipo}</p>
              <p className="truncate">{e.email}</p>
              <p className="truncate">{e.usuario}</p>
              <p className="truncate">{e.contato}</p>
            
    
              <button className="cursor-pointer">
                <UserPen className="hover:text-primary" />
              </button>
    
              <span className="col-span-full h-px bg-text2"></span>
            </div>
          ))}
    
    </div>)
}