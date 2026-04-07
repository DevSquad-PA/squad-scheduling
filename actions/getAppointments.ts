"use server"

import { prisma } from "@/lib/prisma"

export async function getAppointments() {
  return prisma.appointment.findMany({
    include: {
      patient: {
        include: {
          user: true,
        },
      },
      professional: {
        include: {
          user: true,
        },
      },
    },
    orderBy: {
      date: "asc",
    },
  })
}