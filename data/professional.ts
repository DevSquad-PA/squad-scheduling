import { prisma } from "@/lib/prisma";

export const getProfessionalsByClinic = async (clinicId: string) => {
  return await prisma.professional.findMany({
    where: {
      clinicId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });
};

export const getProfessionalById = async (professionalId: string) => {
  return await prisma.professional.findUnique({
    where: { id: professionalId },
    include: { user: true },
  });
};

export const getAppointmentsByClinic = async (clinicId: string) => {
  const appointments = await prisma.appointment.findMany({
    where: { clinicId },
    include: {
      professional: { include: { user: { select: { name: true } } } },
      patient: true,
    },
    orderBy: [{ date: "asc" }, { time: "asc" }],
  });

  const formatHora = (v: any) => {
    if (!v) return "";
    try {
      if (typeof v === "string" && v.includes("T")) {
        const d = new Date(v);
        return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", hour12: false });
      }
      if (typeof v === "string" && /^\d{2}:\d{2}(:\d{2})?$/.test(v)) {
        return v.split(":").slice(0, 2).join(":");
      }
      if (v instanceof Date) {
        return v.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", hour12: false });
      }
      const d = new Date(String(v));
      if (!Number.isNaN(d.getTime())) {
        return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", hour12: false });
      }
    } catch (e) {}
    return String(v).substring(0, 5);
  };

  return appointments.map((a) => {
    return {
      nome: a.professional?.user?.name ?? "---",
      data: new Date(a.date).toLocaleDateString("pt-BR"),
      hora: formatHora(a.time ?? null),
      descricao: Array.isArray(a.services) ? a.services.join(", ") : (a.services as any) ?? "",
    };
  });
};