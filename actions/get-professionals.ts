"use server"

import { prisma } from "@/lib/prisma"

export async function getProfessionals() {
  const professionals = await prisma.professional.findMany({
    select: {
      id: true,
      specialty: true,
      services: true,
      clinicId: true,

      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },

      clinic: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

    console.log("BACKEND PROFESSIONALS:", professionals)

  return professionals
}