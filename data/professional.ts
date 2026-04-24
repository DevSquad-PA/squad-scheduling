"use server";
import { prisma } from "@/lib/prisma";


export const getProfessionalsByClinic = async (clinicId: string) => {
  const professionals = await prisma.professional.findMany({
    where: {
      clinicId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const userIds = professionals
    .map((p) => p.userId)
    .filter((id): id is string => !!id);

  const users = await prisma.user.findMany({
    where: {
      id: {
        in: userIds,
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
    },
  });

  const usersMap = Object.fromEntries(users.map((u) => [u.id, u]));

  return professionals.map((p) => ({
    ...p,
    user: p.userId ? usersMap[p.userId] || null : null,
  }));
};

export const getProfessionalById = async (professionalId: string) => {
  const professional = await prisma.professional.findUnique({
    where: { id: professionalId },
  });

  if (!professional) return null;

  const user = professional.userId
    ? await prisma.user.findUnique({
        where: { id: professional.userId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      })
    : null;

  return {
    ...professional,
    user,
  };
};