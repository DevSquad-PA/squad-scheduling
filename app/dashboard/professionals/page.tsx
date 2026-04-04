"use client"

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
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
import { PhoneInput } from "@/app/components/PhoneInput";

type Professional = {
  id_profissional: string;
  user_id: string;
  clinic_id: string;
  speciality: string | null;
  services: string | null;
  created_at: string;
  user: { name: string; email: string; phone?: string | null };
};

export default function ProfessionalsPage() {
  const { data: session } = authClient.useSession();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!session) return;
    fetch("/api/professionals")
      .then((r) => r.json())
      .then((data) => setProfessionals(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [session]);

  async function createProfessional(payload: any) {
    try {
      const res = await fetch("/api/professionals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("create failed");
      const created = await res.json();
      setProfessionals((p) => [created, ...p]);
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
      p.user.name.toLowerCase().includes(q) ||
      (p.speciality || "").toLowerCase().includes(q) ||
      (p.services || "").toLowerCase().includes(q)
    );
  });

  const ProfessionalsForm = ({ onSubmit, onCancel }: { onSubmit: (p: any) => void; onCancel: () => void }) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [speciality, setSpeciality] = useState("");
    const [services, setServices] = useState("");

    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit({ name, email, phone, speciality, services });
        }}
        className="flex flex-col gap-3"
      >
        <label className="flex flex-col gap-1">
          <span className="text-sm">Nome</span>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm">Email</span>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm">Telefone</span>
          <PhoneInput value={phone} onChange={(e: any) => setPhone(e.target.value)} />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm">Especialidade</span>
          <Input value={speciality} onChange={(e) => setSpeciality(e.target.value)} />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm">Serviços (vírgula separados)</span>
          <Input value={services} onChange={(e) => setServices(e.target.value)} />
        </label>

        <div className="flex gap-2 justify-end mt-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">Salvar</Button>
        </div>
      </form>
    );
  };

  if (!session) return <div>Please log in</div>;
  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4 md:p-8 flex flex-col gap-4">
      <h2 className="font-bold text-base mb-2">Profissionais</h2>

      <div className="flex items-center gap-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="themegreen">Cadastrar profissional</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastro de profissional</DialogTitle>
            </DialogHeader>
            <ProfessionalsForm onSubmit={createProfessional} onCancel={() => setOpen(false)} />
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
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((p) => (
          <Card key={p.id_profissional}>
            <CardHeader>
              <CardTitle>{p.user.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Email: {p.user.email}</p>
              <p>Telefone: {p.user.phone || "N/A"}</p>
              <p>Especialidade: {p.speciality || "N/A"}</p>
              <p>Serviços: {p.services || "N/A"}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
