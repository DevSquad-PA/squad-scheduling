import DashboardClient from "./DashboardClient"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getAppointmentsByClinic } from "@/data/professional"
import { headers } from "next/headers"

export default async function DashboardPage() {
  try {
    const session = await auth.api.getSession({ headers: await headers() as any })
    if (!session) {
      return <div className="p-8">Você precisa estar logado.</div>
    }

    const userId = session.user.id

    let clinicMember = null
    try {
      clinicMember = await prisma.clinicMember.findFirst({
        where: { userId },
        select: { clinicId: true },
      })
    } catch (dbErr) {
      console.error("DB connection error in dashboard page:", dbErr)
      // If DB is unreachable, show the client with empty initial list instead of crashing
      return <DashboardClient initial={[]} />
    }

    if (!clinicMember) {
      return <div className="p-8">Nenhuma clínica encontrada para o usuário.</div>
    }

    const mapped = await getAppointmentsByClinic(clinicMember.clinicId!)

    return <DashboardClient initial={mapped} />
  } catch (err) {
    console.error(err)
    return <DashboardClient initial={[]} />
  }
}