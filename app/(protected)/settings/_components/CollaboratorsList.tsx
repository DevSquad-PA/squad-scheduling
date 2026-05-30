"use client";

import { Search } from "lucide-react";
import { useState, useMemo, useEffect } from "react";

import CollaboratorDialog from "@/app/(protected)/settings/_components/collaboratorDialog";
import DeleteCollaboratorDialog from "@/app/(protected)/settings/_components/DeleteCollaboratorDialog";
import EditCollaboratorDialog from "@/app/(protected)/settings/_components/EditCollaboratorDialog";
import { Input } from "@/components/ui/input";
import { formatPhone } from "@/lib/utils";
import type { Collaborator } from "@/types/collaborators/collaborator";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function CollaboratorsList({
  collaborators,
  canCreate,
  canUpdate,
  canDelete,
}: {
  collaborators: Collaborator[];
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const showActions = canUpdate || canDelete;

  const filteredCollaborators = collaborators.filter((collaborator) => {
    const term = search.toLowerCase();

    return (
      collaborator.name.toLowerCase().includes(term) ||
      collaborator.role.toLowerCase().includes(term) ||
      collaborator.email.toLowerCase().includes(term) ||
      collaborator.username.toLowerCase().includes(term) ||
      collaborator.phone.toLowerCase().includes(term)
    );
  });

  useEffect(() => {
    setPage(1);
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(filteredCollaborators.length / pageSize));

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredCollaborators.slice(start, start + pageSize);
  }, [filteredCollaborators, page]);

  return (
    <div className="flex flex-col gap-4 p-8">
      <h2 className="mb-2 text-base font-bold">Configurações</h2>
      <div className="flex items-center gap-4">
        {canCreate && <CollaboratorDialog />}

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

      <div
        className={`grid w-full items-center gap-x-6 gap-y-1 py-2 text-xs uppercase tracking-[0.1em] text-text2 ${
          showActions ? "grid-cols-[1fr_1fr_1fr_1fr_1fr_auto]" : "grid-cols-5"
        }`}
      >
        <p>Nome</p>
        <p>Cargo</p>
        <p>Email</p>
        <p>Login</p>
        <p>Telefone</p>
        {showActions && <span />}
      </div>

      {filteredCollaborators.length === 0 && (
        <p className="text-sm text-gray-500">
          Nenhum colaborador encontrado
        </p>
      )}

      {paginated.map((collaborator) => (
        <div
          key={collaborator.id}
          className={`grid w-full items-center gap-x-6 gap-y-1 py-2 ${
            showActions
              ? "grid-cols-[1fr_1fr_1fr_1fr_1fr_auto]"
              : "grid-cols-5"
          }`}
        >
          <p className="truncate">{collaborator.name}</p>
          <p className="truncate">{collaborator.role}</p>
          <p className="truncate">{collaborator.email}</p>
          <p className="truncate">{collaborator.username}</p>
          <p className="truncate">{formatPhone(collaborator.phone)}</p>

          {showActions && (
            <div className="flex items-center justify-end gap-1">
              {canUpdate && (
                <EditCollaboratorDialog collaborator={collaborator} />
              )}
              {canDelete && (
                <DeleteCollaboratorDialog collaborator={collaborator} />
              )}
            </div>
          )}

          <span className="bg-text2 col-span-full h-px" />
        </div>
      ))}

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} />
            </PaginationItem>

            {Array.from({ length: totalPages }).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink isActive={i + 1 === page} onClick={() => setPage(i + 1)}>
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
