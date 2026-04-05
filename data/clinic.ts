import { prisma } from "@/lib/prisma";

export const getClinicMemberByUser = async (userId: string) => {
  return await prisma.clinicMember.findFirst({
    where: { userId },
    include: {
      clinic: true,
      role: true,
    },
  });
};
