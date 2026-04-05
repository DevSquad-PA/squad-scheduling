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