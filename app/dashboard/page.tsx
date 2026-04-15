import DashboardClient from "./DashboardClient"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"

export default async function DashboardPage() {
  try {
    const session = await auth.api.getSession({ headers: headers() as any })
    if (!session) {
      return <div className="p-8">Você precisa estar logado.</div>
    }

    const userId = session.user.id

    const clinicMember = await prisma.clinicMember.findFirst({
      where: { userId },
      select: { clinicId: true },
    })

    if (!clinicMember) {
      return <div className="p-8">Nenhuma clínica encontrada para o usuário.</div>
    }

    const appointments = await prisma.appointment.findMany({
      where: { clinicId: clinicMember.clinicId },
      include: {
        professional: { include: { user: { select: { name: true } } } },
        patient: { include: { user: { select: { name: true } } } },
      },
      orderBy: [{ date: "asc" }, { time: "asc" }],
    })

    const mapped = appointments.map((a) => {
      const formatHora = (v: any) => {
        if (!v) return ""
        try {
          if (typeof v === "string" && v.includes("T")) {
            const d = new Date(v)
            return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", hour12: false })
          }
          if (typeof v === "string" && /^\d{2}:\d{2}(:\d{2})?$/.test(v)) {
            return v.split(":").slice(0, 2).join(":")
          }
          if (v instanceof Date) {
            return v.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", hour12: false })
          }
          const d = new Date(String(v))
          if (!Number.isNaN(d.getTime())) {
            return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", hour12: false })
          }
        } catch (e) {}
        return String(v).substring(0,5)
      }

      return {
        nome: a.patient?.user?.name ?? a.professional?.user?.name ?? "---",
        data: new Date(a.date).toLocaleDateString("pt-BR"),
        hora: formatHora(a.time ?? a.appointmentTime ?? null),
        descricao: Array.isArray(a.services) ? a.services.join(", ") : (a.services as any) ?? "",
      }
    })

    return <DashboardClient initial={mapped} />
  } catch (err) {
    console.error(err)
    return <div className="p-8">Erro ao carregar agendamentos.</div>
  }
}