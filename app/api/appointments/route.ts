import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const clinicMember = await prisma.clinicMember.findFirst({
      where: { userId },
      select: { clinicId: true },
    });

    if (!clinicMember) {
      return NextResponse.json({ error: "No clinic found" }, { status: 404 });
    }

    const appointments = await prisma.appointment.findMany({
      where: { clinicId: clinicMember.clinicId },
      include: {
        professional: { include: { user: { select: { name: true } } } },
        patient: { include: { user: { select: { name: true } } } },
      },
      orderBy: [{ date: "asc" }, { time: "asc" }],
    });

    const mapped = appointments.map((a) => ({
      id_appointment: a.id,
      clinic_id: a.clinicId,
      professional_id: a.professionalId,
      patient_id: a.patientId,
      appointment_date: a.date,
      appointment_time: a.time,
      services: Array.isArray(a.services) ? a.services.join(", ") : (a.services as any) ?? null,
      created_at: a.createdAt,
      professional_name: a.professional?.user?.name ?? null,
      patient_name: a.patient?.user?.name ?? null,
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
