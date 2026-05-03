import { getAppointmentsByClinic } from "@/data/appointments";
import DashboardClient from "./DashboardClient";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { headers } from "next/headers";

function formatHora(v: unknown): string {
  if (!v) return "";
  try {
    if (v instanceof Date) {
      return v.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    }
    const s = String(v);
    if (/^\d{2}:\d{2}/.test(s)) return s.substring(0, 5);
    const d = new Date(s);
    if (!isNaN(d.getTime())) {
      return d.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    }
  } catch { }
  return "";
}

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return <div className="p-8">Você precisa estar logado.</div>;
  }

  const clinicMember = await prisma.clinicMember.findFirst({
    where: { userId: session.user.id },
    select: { clinicId: true },
  });

  if (!clinicMember?.clinicId) {
    return (
      <div className="p-8">Nenhuma clínica encontrada para o usuário.</div>
    );
  }

  try {
    const appointments = await getAppointmentsByClinic(clinicMember.clinicId);

    const mapped = appointments.map((a) => {
      const user = a.professional?.user;
      const profissionalNome = user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Sem profissional";

      return {
        nome: profissionalNome,
        data: new Date(a.date).toLocaleDateString("pt-BR"),
        hora: formatHora(a.time),
      descricao: Array.isArray(a.services) ? a.services.join(", ") : "",
      cliente: a.patient?.firstName ?? "Sem nome",
      endereco: a.patient?.addressNumber ?? "Sem endereço",
      contato: a.patient?.phone ?? "Sem contato",
      cpf: a.patient?.cpf ?? "Sem CPF",
      email: a.patient?.email ?? "Sem email",
      };
    });

    return <DashboardClient initial={mapped} />;
  } catch (err) {
    console.error(err);
    return <div className="p-8">Erro ao carregar agendamentos.</div>;
  }
}