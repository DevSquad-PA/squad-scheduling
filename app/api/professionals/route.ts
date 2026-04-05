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

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { name, email, phone, speciality, services } = body;

    // ensure services is array
    const servicesArray = typeof services === "string"
      ? services.split(",").map((s: string) => s.trim()).filter(Boolean)
      : Array.isArray(services) ? services : [];

    // create or find user by email
    let user = null;
    if (email) {
      user = await prisma.user.findUnique({ where: { email } });
    }

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: crypto.randomUUID(),
          name: name || "",
          email: email || "",
          phone: phone || null,
        },
      });
    }

    const professional = await prisma.professional.create({
      data: {
        id: crypto.randomUUID(),
        userId: user.id,
        clinicId: clinicMember.clinicId,
        specialty: speciality || null,
        services: servicesArray,
      },
    });

    const mapped = {
      id_profissional: professional.id,
      user_id: professional.userId,
      clinic_id: professional.clinicId,
      speciality: professional.specialty ?? null,
      services: servicesArray.join(", ") || null,
      created_at: professional.createdAt,
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    };

    return NextResponse.json(mapped, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}