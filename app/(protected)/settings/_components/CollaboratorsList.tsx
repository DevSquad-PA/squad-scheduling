"use client";

import { Search } from "lucide-react";
import { useState } from "react";

import CollaboratorDialog from "@/app/(protected)/settings/_components/collaboratorDialog";
import DeleteCollaboratorDialog from "@/app/(protected)/settings/_components/DeleteCollaboratorDialog";
import EditCollaboratorDialog from "@/app/(protected)/settings/_components/EditCollaboratorDialog";
import { Input } from "@/components/ui/input";
import { formatPhone } from "@/lib/utils";
import type { Collaborator } from "@/types/collaborators/collaborator";

export default function CollaboratorsList({
  collaborators,
}: {
  collaborators: Collaborator[];
}) {
  const [search, setSearch] = useState("");

  const filteredCollaborators = collaborators.filter((collaborator) => {
    const term = search.toLowerCase();

    return (
      collaborator.nome.toLowerCase().includes(term) ||
      collaborator.tipo.toLowerCase().includes(term) ||
      collaborator.email.toLowerCase().includes(term) ||
      collaborator.usuario.toLowerCase().includes(term) ||
      collaborator.contato.toLowerCase().includes(term)
    );
  });

  return (
    <div className="flex flex-col gap-4 p-8">
      <h2 className="mb-2 text-base font-bold">Configurações</h2>
      <div className="flex items-center gap-4">
        <CollaboratorDialog />

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

      {filteredCollaborators.length === 0 && (
        <p className="text-sm text-gray-500">Nenhum colaborador encontrado</p>
      )}

      {filteredCollaborators.map((collaborator) => (
        <div
          key={collaborator.id}
          className="grid w-full grid-cols-[1fr_1fr_1fr_1fr_1fr_auto] items-center gap-x-6 gap-y-1 py-2"
        >
          <p className="truncate">{collaborator.nome}</p>
          <p className="truncate">{collaborator.tipo}</p>
          <p className="truncate">{collaborator.email}</p>
          <p className="truncate">{collaborator.usuario}</p>
          <p className="truncate">{formatPhone(collaborator.contato)}</p>

          <div className="flex items-center justify-end gap-1">
            <EditCollaboratorDialog collaborator={collaborator} />
            <DeleteCollaboratorDialog collaborator={collaborator} />
          </div>

          <span className="bg-text2 col-span-full h-px" />
        </div>
      ))}
    </div>
  );
}
