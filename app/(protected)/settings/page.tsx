import { headers } from "next/headers";

import CollaboratorsList from "@/app/(protected)/settings/_components/CollaboratorsList";
import { getCollaboratorsByClinic } from "@/data/collaborators";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function Settings() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return <div className="p-8">Você precisa estar logado.</div>;
  }

  const clinicMember = await prisma.clinicMember.findFirst({
    where: { userId: session.user.id },
    select: { clinicId: true },
  });

  if (!clinicMember?.clinicId) {
    return <div className="p-8">Nenhuma clínica encontrada para o usuário.</div>;
  }

  const collaborators = await getCollaboratorsByClinic(clinicMember.clinicId);

  return <CollaboratorsList collaborators={collaborators} />;
}
