"use client";

import { Search } from "lucide-react";
import { useState, useTransition } from "react";

import { createProfessional as createProfessionalAction } from "@/actions/professionalActions/create-professional";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { formatPhone } from "@/lib/utils";
import type {
  CreateProfessionalInput,
  Professional,
} from "@/types/professionals/professional";

import Link from "next/link";

export default function ProfessionalsList({
  initial,
}: {
  initial: Professional[];
}) {
  const ITEMS_PER_PAGE = 16;
  const COLUMNS = 4;

  const [professionals, setProfessionals] = useState<Professional[]>(initial);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [isPending, startTransition] = useTransition();

  async function createProfessional(payload: CreateProfessionalInput) {
    startTransition(async () => {
      const res = await createProfessionalAction(payload);
      if (res?.validationErrors) {
        console.error("Erros de validação ao criar profissional:", res.validationErrors);
        const errors: string[] = [];
        if (res.validationErrors._errors) {
          errors.push(...res.validationErrors._errors);
        }
        Object.entries(res.validationErrors).forEach(([key, val]) => {
          if (key !== "_errors") {
            if (Array.isArray(val)) {
              val.forEach((item) => {
                if (typeof item === "string") errors.push(item);
              });
            } else if (val && typeof val === "object" && "_errors" in val) {
              const fieldErrors = (val as any)._errors;
              if (Array.isArray(fieldErrors)) {
                fieldErrors.forEach((item) => {
                  if (typeof item === "string") errors.push(item);
                });
              }
            }
          }
        });
        const errorMsg = errors.length > 0 ? errors[0] : "Erro de validação ao criar profissional.";
        alert(errorMsg);
        return;
      }
      if (res?.serverError) {
        console.error("Erro interno do servidor ao criar profissional:", res.serverError);
        alert(res.serverError);
        return;
      }
      if (res?.data) {
        setProfessionals((prev) => [res.data as Professional, ...prev]);
        setOpen(false);
      }
    });
  }

  const filtered = professionals.filter((p) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (p.user?.name ?? "").toLowerCase().includes(q) ||
      (p.specialty ?? "").toLowerCase().includes(q) ||
      p.services.join(", ").toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedProfessionals = filtered.slice(startIndex, endIndex);

  const ProfessionalsForm = ({
    onSubmit,
    onCancel,
  }: {
    onSubmit: (p: CreateProfessionalInput) => void;
    onCancel: () => void;
  }) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [specialty, setSpecialty] = useState("");
    const [services, setServices] = useState("");

    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit({
            name,
            email,
            phone,
            specialty,
            services: services
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
          });
        }}
        className="flex flex-col gap-3"
      >
        <label className="flex flex-col gap-1">
          <span className="text-sm">Nome</span>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm">Email</span>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm">Telefone</span>
          <Input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            maxLength={15}
            placeholder="(11) 98765-4321"
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm">Especialidade</span>
          <Input
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm">Serviços (separados por vírgula)</span>
          <Input
            value={services}
            onChange={(e) => setServices(e.target.value)}
          />
        </label>
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">Salvar</Button>
        </div>
      </form>
    );
  };

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <h2 className="mb-2 text-base font-bold">Profissionais</h2>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="w-fit">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="themegreen">Cadastrar profissional</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cadastro de profissional</DialogTitle>
                <DialogDescription className="sr-only">
                  Formulário para cadastrar um novo profissional na clínica.
                </DialogDescription>
              </DialogHeader>
              <ProfessionalsForm
                onSubmit={createProfessional}
                onCancel={() => setOpen(false)}
              />
              <DialogFooter />
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative w-full max-w-xs md:w-fit">
          <Input
            placeholder="Pesquisar"
            className="w-full pr-10"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
          <Search className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <div
        className={`grid gap-4 ${COLUMNS === 4 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}
      >
        {paginatedProfessionals.length === 0 && (
          <p className="col-span-full text-sm text-gray-500">
            Nenhum profissional encontrado.
          </p>
        )}
        {paginatedProfessionals.map((p) => (
          <Link key={p.id} href={`/professionals/profile/${p.id}`}>
            <Card>
              <CardHeader>
                <CardTitle>{p.user?.name ?? "—"}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-1 text-sm">
                <p>Email: {p.user?.email ?? "—"}</p>
                <p>Telefone: {p.user?.phone ?? "N/A"}</p>
                <p>Especialidade: {p.specialty ?? "N/A"}</p>
                <p>Serviços: {p.services?.join(", ") || "N/A"}</p>
              </CardContent>
            </Card>
          </Link>
          
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      isActive={page === currentPage}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
