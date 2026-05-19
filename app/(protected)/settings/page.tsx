"use client";

import { Search, UserPen } from "lucide-react";
import { useState } from "react";

import CollaboratorDialog from "@/app/(protected)/settings/_components/collaboratorDialog";
import { Input } from "@/components/ui/input";
import type { Colaboradores } from "@/types/collaborators/collaborator";
import { useEffect } from "react";

export default function Settings() {
  const [search, setSearch] = useState("");

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
  ];

  const [collaborators, setCollaborators] = useState<Colaboradores[]>(exemplo);

  // persist collaborators to localStorage so reload keeps them
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("collaborators");
      if (raw) {
        setCollaborators(JSON.parse(raw));
      }
    } catch (e) {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem("collaborators", JSON.stringify(collaborators));
    } catch (e) {
      /* ignore */
    }
  }, [collaborators]);

  return (
    <div className="flex flex-col gap-4 p-8">
      <h2 className="mb-2 text-base font-bold">Configurações</h2>
      <div className="flex items-center gap-4">
        <CollaboratorDialog onCreate={(c) => setCollaborators((s) => [c, ...s])} />

        <div className="relative w-fit">
          <Input
            placeholder="Pesquisar"
            className="w-80 pr-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="text-text2 absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
        </div>
      </div>

      {collaborators.length === 0 && (
        <p className="text-sm text-gray-500">Nenhum agendamento</p>
      )}

      {collaborators.map((e, i) => (
        <div
          key={i}
          className="grid w-full grid-cols-[1fr_1fr_1fr_1fr_1fr_auto] items-center gap-x-6 gap-y-1 py-2"
        >
          <p className="truncate">{e.nome}</p>
          <p className="truncate">{e.tipo}</p>
          <p className="truncate">{e.email}</p>
          <p className="truncate">{e.usuario}</p>
          <p className="truncate">{e.contato}</p>

          <CollaboratorDialog
            initial={e}
            onUpdate={(c) => setCollaborators((s) => s.map((it, ii) => (ii === i ? c : it)))}
            trigger={
              <button className="cursor-pointer">
                <UserPen className="hover:text-primary" />
              </button>
            }
          />

          <span className="bg-text2 col-span-full h-px"></span>
        </div>
      ))}
    </div>
  );
}
