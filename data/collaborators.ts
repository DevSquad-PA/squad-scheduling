import { prisma } from "@/lib/prisma";
import type { Collaborator } from "@/types/collaborators/collaborator";

export const getCollaboratorsByClinic = async (
  clinicId: string,
): Promise<Collaborator[]> => {
  const members = await prisma.clinicMember.findMany({
    where: { clinicId },
    include: {
      role: true,
      user: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return members.map((member) => ({
    id: member.id,
    name: member.user?.name ?? "",
    username: member.user?.email.split("@")[0] ?? "",
    email: member.user?.email ?? "",
    phone: member.user?.phone ?? "",
    role: member.role?.description ?? "Atendimento",
  }));
};
