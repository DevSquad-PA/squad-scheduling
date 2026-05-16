import { prisma } from "@/lib/prisma";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const professional  = await prisma.professional.findUnique({
        where: { id },
        include: { user: true },
  })

    return (
        <div className="text-black">
            <h1>Profissinal: {professional?.user?.name}</h1>
        </div>
    )
}