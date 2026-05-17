import { prisma } from "@/lib/prisma";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const professional  = await prisma.professional.findUnique({
        where: { id },
        include: { user: true },
  })

    return (
        <div className="flex flex-col gap-5 p-5 text-primary">
            <div className="text-black flex flex-row gap-5">
                <img src={professional?.user?.image || "/placeholder-image.jpg"} alt={professional?.user?.name} width={200} height={200} className="border-2 "/>
            <div className="flex flex-col gap-2">
                <p><strong>Nome:</strong> {professional?.user?.name}</p>
                <p><strong>Specialty:</strong> {professional?.specialty}</p>
                <p><strong>Email:</strong> {professional?.user?.email}</p>
            </div>                
            </div>
            <Link href="/professionals" className="w-fit font-bold flex items-center">
                <ChevronLeft className="h-8 w-8" />
                Voltar
            </Link>
        </div>
    )
}