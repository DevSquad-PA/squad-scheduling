"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PhoneInput } from "@/app/dashboard/components/PhoneInput";

type Professional = {
  id: string;
  userId: string | null;
  clinicId: string | null;
  specialty: string | null;
  services: string[];
  createdAt: Date | null;
  user: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
  } | null;
};

export default function ProfessionalsList({
  initial,
}: {
  initial: Professional[];
}) {
  const [professionals, setProfessionals] = useState<Professional[]>(initial);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  async function createProfessional(payload: any) {
    try {
      const res = await fetch("/api/professionals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("create failed");
      const created = await res.json();
      setProfessionals((prev) => [created, ...prev]);
      setOpen(false);
    } catch (e) {
      console.error(e);
      alert("Erro ao criar profissional");
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

  const ProfessionalsForm = ({
    onSubmit,
    onCancel,
  }: {
    onSubmit: (p: any) => void;
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
          <PhoneInput
            value={phone}
            onChange={(e: any) => setPhone(e.target.value)}
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

      <div className="flex items-center gap-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="themegreen">Cadastrar profissional</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastro de profissional</DialogTitle>
            </DialogHeader>
            <ProfessionalsForm
              onSubmit={createProfessional}
              onCancel={() => setOpen(false)}
            />
            <DialogFooter />
          </DialogContent>
        </Dialog>

        <div className="relative w-full max-w-xs md:w-fit">
          <Input
            placeholder="Pesquisar"
            className="w-full pr-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 && (
          <p className="col-span-full text-sm text-gray-500">
            Nenhum profissional encontrado.
          </p>
        )}
        {filtered.map((p) => (
          <Card key={p.id}>
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
        ))}
      </div>
    </div>
  );
}
