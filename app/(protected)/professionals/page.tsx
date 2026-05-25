import { headers } from "next/headers";

import { getProfessionalsByClinic } from "@/data/professional";
import { auth } from "@/lib/auth";
import { getPermissions } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

import ProfessionalsList from "./_components/ProfessionalsList";

export default async function ProfessionalsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return <div className="p-8">Você precisa estar logado.</div>;
  }

  const userId = session.user.id;

  const clinicMember = await prisma.clinicMember.findFirst({
    where: { userId },
    include: { role: true },
  });

  if (!clinicMember?.clinicId) {
    return (
      <div className="p-8">
        Nenhuma clínica encontrada para o usuário. userId: {userId}
      </div>
    );
  }

  const professionals = await getProfessionalsByClinic(clinicMember.clinicId);
  const permissions = getPermissions(clinicMember.role?.description);

  return (
    <ProfessionalsList
      initial={professionals}
      canCreate={permissions.canCreate}
    />
  );
}
