import { prisma } from "@/lib/prisma";

export type RoleDescription = "Administrador" | "Atendimento" | "Médico";

export type ClinicAccess = {
  clinicId: string;
  role: RoleDescription;
  professionalId: string | null;
};

const rolePermissions = {
  Administrador: {
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    canView: true,
  },
  Atendimento: {
    canCreate: true,
    canUpdate: true,
    canDelete: false,
    canView: true,
  },
  Médico: {
    canCreate: false,
    canUpdate: false,
    canDelete: false,
    canView: true,
  },
} satisfies Record<RoleDescription, Record<string, boolean>>;

export function normalizeRole(role?: string | null): RoleDescription {
  if (role === "Administrador" || role === "Médico") {
    return role;
  }

  return "Atendimento";
}

export function getPermissions(role?: string | null) {
  return rolePermissions[normalizeRole(role)];
}

export async function getClinicAccessByUser(
  userId: string,
): Promise<ClinicAccess | null> {
  const clinicMember = await prisma.clinicMember.findFirst({
    where: { userId },
    include: {
      role: true,
    },
  });

  if (!clinicMember?.clinicId) {
    return null;
  }

  const professional = await prisma.professional.findFirst({
    where: {
      userId,
      clinicId: clinicMember.clinicId,
    },
    select: {
      id: true,
    },
  });

  return {
    clinicId: clinicMember.clinicId,
    role: normalizeRole(clinicMember.role?.description),
    professionalId: professional?.id ?? null,
  };
}
