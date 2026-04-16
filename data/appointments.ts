import { prisma } from "@/lib/prisma";

export const getAppointmentsByClinic = async (clinicId: string) => {
  return await prisma.appointment.findMany({
    where: { clinicId },
    include: {
      professional: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      patient: true,
    },
    orderBy: [{ date: "asc" }, { time: "asc" }],
  });
};