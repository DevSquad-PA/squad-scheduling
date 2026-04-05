"use server";

import { z } from "zod";
import { actionClient } from "@/lib/action-client";
import { prisma } from "@/lib/prisma";
import { endOfDay, format, startOfDay } from "date-fns";

const inputSchema = z.object({
  professionalId: z.string().uuid(),
  date: z.date(),
});

const TIME_SLOTS = [
  "09:00","10:00", "11:00", 
  "12:00", "13:00", "14:00",
  "15:00", "16:00", "17:00",
];

export const getAvailableTime = actionClient
  .inputSchema(inputSchema)
  .action(async ({ parsedInput: { professionalId, date } }) => {
    const appointments = await prisma.appointment.findMany({
      where: {
        professionalId,
         date: {
          gte: startOfDay(date),
          lte: endOfDay(date),
        },
      },
    });

    const occupiedSlots = appointments.map(
      (appointment) => format(appointment.time, "HH:mm")
    );

     const availableTimeSlots = TIME_SLOTS.filter(
      (slot) => !occupiedSlots.includes(slot),
    );
    
    return availableTimeSlots;
  });