"use client"

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

type Professional = {
  id_profissional: string;
  user_id: string;
  clinic_id: string;
  speciality: string | null;
  services: string | null; // CSV or text
  created_at: string;
  user: {
    name: string;
    email: string;
    phone: string | null;
  };
};

export default function ProfessionalsPage() {
  const { data: session } = authClient.useSession();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetch("/api/professionals")
        .then((res) => res.json())
        .then((data) => {
          setProfessionals(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [session]);

  const filteredProfessionals = professionals.filter((p) => {
    const nameMatch = p.user.name.toLowerCase().includes(search.toLowerCase());
    const specialityMatch = p.speciality?.toLowerCase().includes(search.toLowerCase());
    const servicesText = p.services || "";
    const servicesMatch = servicesText.toLowerCase().includes(search.toLowerCase());
    return nameMatch || specialityMatch || servicesMatch;
  });

  if (!session) {
    return <div>Please log in</div>;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4 md:p-8 flex flex-col gap-4">
      <h2 className="font-bold text-base mb-2">Profissionais</h2>

      <div className="relative w-full max-w-xs md:w-fit">
        <Input
          placeholder="Pesquisar"
          className="w-full pr-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProfessionals.map((professional) => (
          <Card key={professional.id_profissional}>
            <CardHeader>
              <CardTitle>{professional.user.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Email: {professional.user.email}</p>
              <p>Telefone: {professional.user.phone || "N/A"}</p>
              <p>Especialidade: {professional.speciality || "N/A"}</p>
              <p>Serviços: {professional.services || "N/A"}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}