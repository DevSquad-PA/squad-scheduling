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

    // Get clinicId from user's clinicMembers
    const clinicMember = await prisma.clinicMember.findFirst({
      where: { userId },
      select: { clinicId: true },
    });

    if (!clinicMember) {
      return NextResponse.json({ error: "No clinic found" }, { status: 404 });
    }

    const professionals = await prisma.professional.findMany({
      where: { clinicId: clinicMember.clinicId },
      include: {
        user: {
          select: { name: true, email: true, phone: true },
        },
      },
    });

    // Map DB fields to the requested shape
    const mapped = professionals.map((p) => ({
      id_profissional: p.id,
      user_id: p.userId,
      clinic_id: p.clinicId,
      speciality: p.specialty ?? null,
      services: Array.isArray(p.services) ? p.services.join(", ") : (p.services as any) ?? null,
      created_at: p.createdAt,
      user: p.user,
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}