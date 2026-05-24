"use server";

import { revalidatePath } from "next/cache";
import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";

import { protectedActionClient } from "@/lib/action-client";
import { getClinicAccessByUser, getPermissions } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

const inputSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().optional(),
  specialty: z.string().optional(),
  services: z.array(z.string()).optional(),
});

export const createProfessional = protectedActionClient
  .inputSchema(inputSchema)
  .action(async ({ parsedInput: { name, email, phone, specialty, services }, ctx }) => {
    const userId = ctx.user.id;
    const access = await getClinicAccessByUser(userId);
    const permissions = getPermissions(access?.role);

    if (!access || !permissions.canCreate) {
      return returnValidationErrors(inputSchema, {
        _errors: ["Você não tem permissão para criar profissionais."],
      });
    }

    // 1. Buscar a clínica que o usuário logado faz parte
    const clinicMember = await prisma.clinicMember.findFirst({
      where: { userId },
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

    // 2. Criar ou buscar o User para este profissional
    let doctorUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!doctorUser) {
      doctorUser = await prisma.user.create({
        data: {
          name,
          email,
          phone,
          emailVerified: true,
        },
      });
    } else {
      // Se o usuário já existir, apenas atualizamos o telefone se não estiver preenchido
      if (!doctorUser.phone && phone) {
        doctorUser = await prisma.user.update({
          where: { id: doctorUser.id },
          data: { phone },
        });
      }
    }

    // 3. Garantir que a Role "Médico" exista no banco
    let doctorRole = await prisma.role.findFirst({
      where: { description: "Médico" },
    });

    if (!doctorRole) {
      doctorRole = await prisma.role.create({
        data: {
          description: "Médico",
        },
      });
    }

    // 4. Criar o vínculo do profissional com a clínica (ClinicMember)
    const existingMember = await prisma.clinicMember.findFirst({
      where: {
        userId: doctorUser.id,
        clinicId,
      },
    });

    if (!existingMember) {
      await prisma.clinicMember.create({
        data: {
          userId: doctorUser.id,
          clinicId,
          roleId: doctorRole.id,
        },
      });
    }

    // 5. Criar o registro Professional vinculado a este User e Clínica
    let professional = await prisma.professional.findFirst({
      where: {
        userId: doctorUser.id,
        clinicId,
      },
    });

    if (!professional) {
      professional = await prisma.professional.create({
        data: {
          userId: doctorUser.id,
          clinicId,
          specialty,
          services: services || [],
        },
      });
    } else {
      return returnValidationErrors(inputSchema, {
        _errors: ["Profissional já está cadastrado nesta clínica."],
      });
    }

    // Revalidar as páginas para atualizar os dados
    revalidatePath("/professionals");
    revalidatePath("/appointments");

    // Retornar o profissional formatado como a UI espera
    return {
      id: professional.id,
      userId: professional.userId,
      clinicId: professional.clinicId,
      specialty: professional.specialty,
      services: professional.services,
      createdAt: professional.createdAt,
      user: {
        id: doctorUser.id,
        name: doctorUser.name,
        email: doctorUser.email,
        phone: doctorUser.phone,
      },
    };
  });
