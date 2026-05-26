"use server";

import { revalidatePath } from "next/cache";
import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";

import { protectedActionClient } from "@/lib/action-client";
import { getClinicAccessByUser, getPermissions } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

const inputSchema = z.object({
  userId: z.string().uuid("Selecione um medico valido"),
  specialty: z.string().optional(),
  services: z.array(z.string()).optional(),
});

export const createProfessional = protectedActionClient
  .inputSchema(inputSchema)
  .action(async ({ parsedInput: { userId, specialty, services }, ctx }) => {
    const access = await getClinicAccessByUser(ctx.user.id);
    const permissions = getPermissions(access?.role);

    if (!access || !permissions.canCreate) {
      return returnValidationErrors(inputSchema, {
        _errors: ["Você não tem permissão para criar profissionais."],
      });
    }

    const clinicMember = await prisma.clinicMember.findFirst({
      where: { userId: ctx.user.id },
      select: { clinicId: true },
    });

    if (!clinicMember?.clinicId) {
      return returnValidationErrors(inputSchema, {
        _errors: ["Nenhuma clínica encontrada para este usuário."],
      });
    }

    if (clinicMember.clinicId !== access.clinicId) {
      return returnValidationErrors(inputSchema, {
        _errors: ["Clínica inválida para este usuário."],
      });
    }

    const clinicId = clinicMember.clinicId;

    const doctorMember = await prisma.clinicMember.findFirst({
      where: {
        userId,
        clinicId,
        role: {
          description: "Médico",
        },
      },
      include: {
        user: true,
      },
    });

    if (!doctorMember?.user) {
      return returnValidationErrors(inputSchema, {
        _errors: ["Selecione um medico cadastrado nesta clinica."],
      });
    }

    const existingProfessional = await prisma.professional.findFirst({
      where: {
        userId,
        clinicId,
      },
    });

    if (existingProfessional) {
      return returnValidationErrors(inputSchema, {
        _errors: ["Profissional já está cadastrado nesta clínica."],
      });
    }

    const professional = await prisma.professional.create({
      data: {
        userId,
        clinicId,
        specialty,
        services: services || [],
      },
    });

    revalidatePath("/professionals");
    revalidatePath("/appointments");

    return {
      id: professional.id,
      userId: professional.userId,
      clinicId: professional.clinicId,
      specialty: professional.specialty,
      services: professional.services,
      createdAt: professional.createdAt,
      user: {
        id: doctorMember.user.id,
        name: doctorMember.user.name,
        email: doctorMember.user.email,
        phone: doctorMember.user.phone,
      },
    };
  });
