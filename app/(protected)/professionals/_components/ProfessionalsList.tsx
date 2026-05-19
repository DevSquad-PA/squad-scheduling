"use client";

import { Search } from "lucide-react";
import { useState, useTransition } from "react";

import { createProfessional as createProfessionalAction } from "@/actions/professionalActions/create-professional";
import { updateProfessional as updateProfessionalAction } from "@/actions/professionalActions/update-professional";
import { deleteProfessional as deleteProfessionalAction } from "@/actions/professionalActions/delete-professional";
import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";
import { useToast } from "@/components/ui/toast";
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
  const [editOpen, setEditOpen] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingProfessional, setDeletingProfessional] = useState<Professional | null>(null);
  const [createPending, setCreatePending] = useState(false);
  const [updatePending, setUpdatePending] = useState(false);
  const [deletePending, setDeletePending] = useState(false);
  const toast = useToast();

  async function createProfessional(payload: CreateProfessionalInput) {
    setCreatePending(true);
    try {
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
        toast.error("Erro", errorMsg);
        return;
      }
      if (res?.serverError) {
        console.error("Erro interno do servidor ao criar profissional:", res.serverError);
        toast.error("Erro", String(res.serverError));
        return;
      }
      if (res?.data) {
        setProfessionals((prev) => [res.data as Professional, ...prev]);
        setOpen(false);
        toast.success("Profissional criado", "Cadastro realizado com sucesso.");
      }
    } catch (e) {
      console.error(e);
      const msg = e instanceof Error ? e.message : "Erro ao criar profissional";
      toast.error("Erro", msg);
    } finally {
      setCreatePending(false);
    }
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
          <Button type="submit" disabled={createPending}>{createPending ? "Cadastrando..." : "Cadastrar"}</Button>
        </div>
      </form>
    );
  };

  const EditProfessionalForm = ({
    initial,
    onSubmit,
    onCancel,
  }: {
    initial: Partial<CreateProfessionalInput>;
    onSubmit: (p: CreateProfessionalInput) => void;
    onCancel: () => void;
  }) => {
    const [name, setName] = useState(initial.name ?? "");
    const [email, setEmail] = useState(initial.email ?? "");
    const [phone, setPhone] = useState(initial.phone ?? "");
    const [specialty, setSpecialty] = useState(initial.specialty ?? "");
    const initialServices = Array.isArray(initial.services)
      ? (initial.services as string[]).join(", ")
      : typeof initial.services === "string"
      ? (initial.services as string)
      : "";

    const [services, setServices] = useState(initialServices);

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
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm">Email</span>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm">Telefone</span>
          <Input type="tel" inputMode="tel" autoComplete="tel" maxLength={15} placeholder="(11) 98765-4321" value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm">Especialidade</span>
          <Input value={specialty} onChange={(e) => setSpecialty(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm">Serviços (separados por vírgula)</span>
          <Input value={services} onChange={(e) => setServices(e.target.value)} />
        </label>
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={updatePending}>{updatePending ? "Salvando..." : "Salvar"}</Button>
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
              <Button variant="themegreen" disabled={createPending} aria-busy={createPending}>
                {createPending ? "Cadastrando..." : "Cadastrar profissional"}
              </Button>
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
          <Card key={p.id}>
            <CardHeader className="flex items-center justify-between pb-2">
              <CardTitle>
                <Link href={`/professionals/profile/${p.id}`}>{p.user?.name ?? "—"}</Link>
              </CardTitle>
              <div className="flex gap-2">
                <Dialog open={editOpen && editingProfessional?.id === p.id} onOpenChange={(open) => { if (!open) setEditingProfessional(null); setEditOpen(open); }}>
                  <Button size="sm" variant="outline" onClick={() => { setEditingProfessional(p); setEditOpen(true); }} aria-label={`Editar ${p.user?.name ?? "profissional"}`}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Editar profissional</DialogTitle>
                    </DialogHeader>
                    <EditProfessionalForm
                      initial={{
                        name: p.user?.name ?? "",
                        email: p.user?.email ?? "",
                        phone: p.user?.phone ?? "",
                        specialty: p.specialty ?? "",
                        services: p.services?.join(", ") ?? "",
                      }}
                      onSubmit={async (payload) => {
                        setUpdatePending(true);
                        try {
                          const res = await updateProfessionalAction({ professionalId: p.id, ...payload } as any);
                          if ((res as any)?.validationErrors) {
                            const ve = (res as any).validationErrors;
                            const errs: string[] = [];
                            if (ve._errors) errs.push(...ve._errors);
                            Object.entries(ve).forEach(([key, val]) => {
                              if (key !== "_errors") {
                                if (Array.isArray(val)) {
                                  val.forEach((item) => { if (typeof item === "string") errs.push(item); });
                                } else if (val && typeof val === "object" && "_errors" in (val as any)) {
                                  const fe = (val as any)._errors;
                                  if (Array.isArray(fe)) fe.forEach((it) => { if (typeof it === "string") errs.push(it); });
                                }
                              }
                            });
                            toast.error("Erro", errs.length > 0 ? errs[0] : "Erro de validação ao atualizar profissional.");
                            return;
                          }
                          if ((res as any)?.serverError) {
                            toast.error("Erro", String((res as any).serverError));
                            return;
                          }
                          // Atualiza localmente mesclando os campos
                          setProfessionals((prev) => prev.map((item) => item.id === p.id ? {
                            ...item,
                            specialty: payload.specialty ?? item.specialty,
                            services: payload.services ?? item.services,
                            user: {
                              ...item.user,
                              name: payload.name ?? item.user?.name,
                              email: payload.email ?? item.user?.email,
                              phone: payload.phone ?? item.user?.phone,
                            }
                          } : item));
                          setEditOpen(false);
                          setEditingProfessional(null);
                          toast.success("Profissional atualizado", "Alterações salvas com sucesso.");
                        } catch (e) {
                          console.error(e);
                          const msg = e instanceof Error ? e.message : "Erro ao atualizar profissional";
                          toast.error("Erro", msg);
                        } finally {
                          setUpdatePending(false);
                        }
                      }}
                      onCancel={() => { setEditOpen(false); setEditingProfessional(null); }}
                    />
                    <DialogFooter />
                  </DialogContent>
                </Dialog>

                <Dialog open={deleteOpen && deletingProfessional?.id === p.id} onOpenChange={(open) => { if (!open) setDeletingProfessional(null); setDeleteOpen(open); }}>
                  <Button size="sm" variant="destructive" onClick={() => { setDeletingProfessional(p); setDeleteOpen(true); }} aria-label={`Excluir ${p.user?.name ?? "profissional"}`}>
                    <Trash className="h-4 w-4" />
                  </Button>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Excluir profissional</DialogTitle>
                    </DialogHeader>
                    <div className="mt-2">
                      <p>Deseja realmente excluir <strong>{p.user?.name ?? "este profissional"}</strong>? Essa ação não pode ser desfeita.</p>
                    </div>
                    <DialogFooter className="mt-4 flex items-center justify-end gap-2">
                      <Button variant="outline" onClick={() => { setDeleteOpen(false); setDeletingProfessional(null); }} disabled={deletePending}>Cancelar</Button>
                      <Button variant="destructive" onClick={async () => {
                        setDeletePending(true);
                        try {
                          const res = await deleteProfessionalAction({ professionalId: p.id } as any);
                          if ((res as any)?.validationErrors) {
                            const ve = (res as any).validationErrors;
                            const errs: string[] = [];
                            if (ve._errors) errs.push(...ve._errors);
                            Object.entries(ve).forEach(([key, val]) => {
                              if (key !== "_errors") {
                                if (Array.isArray(val)) {
                                  val.forEach((item) => { if (typeof item === "string") errs.push(item); });
                                }
                              }
                            });
                            toast.error("Erro", errs.length > 0 ? errs[0] : "Erro ao excluir profissional.");
                            return;
                          }
                          if ((res as any)?.serverError) {
                            toast.error("Erro", String((res as any).serverError));
                            return;
                          }
                          setProfessionals((prev) => prev.filter((item) => item.id !== p.id));
                          setDeleteOpen(false);
                          setDeletingProfessional(null);
                          toast.success("Profissional excluído", "Operação realizada com sucesso.");
                        } catch (e) {
                          console.error(e);
                          const msg = e instanceof Error ? e.message : "Erro ao excluir profissional";
                          toast.error("Erro", msg);
                        } finally {
                          setDeletePending(false);
                        }
                      }} disabled={deletePending}>{deletePending ? "Excluindo..." : "Excluir"}</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-1 text-sm">
              <p>Email: {p.user?.email ?? "—"}</p>
              <p>Telefone: {p.user?.phone ?? "N/A"}</p>
              <p>Especialidade: {p.specialty ?? "N/A"}</p>
              <p>Serviços: {p.services?.join(", ") || "N/A"}</p>
            </CardContent>
          </Card>
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
