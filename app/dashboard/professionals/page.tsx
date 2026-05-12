import { headers } from "next/headers";

import { getProfessionalsByClinic } from "@/data/professional";
import { auth } from "@/lib/auth";
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
  console.log("[professionals] userId:", userId);

  const clinicMember = await prisma.clinicMember.findFirst({
    where: { userId },
    select: { clinicId: true },
  });

  console.log("[professionals] clinicMember:", clinicMember);

  if (!clinicMember?.clinicId) {
    return (
      <div className="p-8">
        Nenhuma clínica encontrada para o usuário. userId: {userId}
      </div>
    );
  }

  const professionals = await getProfessionalsByClinic(clinicMember.clinicId);

  return <ProfessionalsList initial={professionals} />;
}
