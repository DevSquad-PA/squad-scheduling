"use server";

import { z } from "zod";

import { actionClient } from "@/lib/action-client";
import { prisma } from "@/lib/prisma";

const inputSchema = z.object({
  clinicId: z.string().uuid(),
});

export const getPatientsWithBookings = actionClient
  .inputSchema(inputSchema)
  .action(async ({ parsedInput: { clinicId } }) => {
    const patients = await prisma.patient.findMany({
      where: {
        clinicId,
      },
      orderBy: {
        firstName: "asc",
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        cpf: true,
        phone: true,
        addressNumber: true,
      },
    });

    return patients;
  });
