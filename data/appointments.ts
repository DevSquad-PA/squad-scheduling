import { prisma } from "@/lib/prisma";

export const getAppointmentsByClinic = async (clinicId: string) => {
  return await prisma.appointment.findMany({
    where: { clinicId },
    include: {
      professional: {
        include: {
          user: true,
        },
      },
      patient: true,
    },
    orderBy: [{ date: "asc" }, { time: "asc" }],
  });
};