"use server";

import { hashPassword } from "better-auth/crypto";
import { revalidatePath } from "next/cache";
import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";

import { protectedActionClient } from "@/lib/action-client";
import { getClinicAccessByUser, getPermissions } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

const inputSchema = z.object({
  nome: z.string().min(3, "Nome obrigatório"),
  usuario: z.string().min(3, "Usuário obrigatório"),
  email: z.string().email("Email inválido"),
  senha: z.string().min(6, "Senha mínima 6 caracteres"),
  contato: z.string().min(10, "Telefone inválido"),
  tipo: z.enum(["Administrador", "Atendimento", "Médico"], {
    message: "Selecione o tipo",
  }),
});

export const createCollaborator = protectedActionClient
  .inputSchema(inputSchema)
  .action(async ({ parsedInput, ctx }) => {
    const access = await getClinicAccessByUser(ctx.user.id);
    const permissions = getPermissions(access?.role);

    if (!access || !permissions.canCreate) {
      return returnValidationErrors(inputSchema, {
        _errors: ["Você não tem permissão para criar colaboradores."],
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

    let role = await prisma.role.findUnique({
      where: { description: parsedInput.tipo },
    });

    if (!role) {
      role = await prisma.role.create({
        data: { description: parsedInput.tipo },
      });
    }

    const email = parsedInput.email.toLowerCase();

    let user = await prisma.user.findUnique({
      where: { email },
    });

    const nameParts = parsedInput.nome.trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || null;
    const phone = parsedInput.contato.replace(/\D/g, "");

    if (!user) {
      const password = await hashPassword(parsedInput.senha);

      user = await prisma.user.create({
        data: {
          name: parsedInput.nome,
          email,
          firstName,
          lastName,
          phone,
          emailVerified: true,
        },
      });

      await prisma.account.create({
        data: {
          userId: user.id,
          accountId: user.id,
          providerId: "credential",
          password,
        },
      });
    } else {
      const credentialAccount = await prisma.account.findFirst({
        where: {
          userId: user.id,
          providerId: "credential",
        },
      });

      if (!credentialAccount) {
        await prisma.account.create({
          data: {
            userId: user.id,
            accountId: user.id,
            providerId: "credential",
            password: await hashPassword(parsedInput.senha),
          },
        });
      }

      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: user.name || parsedInput.nome,
          firstName: user.firstName || firstName,
          lastName: user.lastName || lastName,
          phone: user.phone || phone,
        },
      });
    }

    const existingMember = await prisma.clinicMember.findFirst({
      where: {
        userId: user.id,
        clinicId: clinicMember.clinicId,
      },
    });

    if (existingMember) {
      return returnValidationErrors(inputSchema, {
        _errors: ["Colaborador já cadastrado nesta clínica."],
      });
    }

    const collaborator = await prisma.clinicMember.create({
      data: {
        userId: user.id,
        clinicId: clinicMember.clinicId,
        roleId: role.id,
      },
      include: {
        role: true,
        user: true,
      },
    });

    revalidatePath("/settings");

    return collaborator;
  });
