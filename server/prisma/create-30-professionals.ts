import { randomUUID } from "crypto";
import dotenv from "dotenv";
import { PrismaClient } from "../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

dotenv.config();

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  try {
    console.log("Iniciando criação de 30 profissionais de teste...");

    const adminEmail = "dev@squadscheduling.local";
    const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (!admin) throw new Error(`Usuário admin não encontrado: ${adminEmail}`);

    const clinic = await prisma.clinic.findFirst({
      where: { members: { some: { userId: admin.id } } },
    });

    if (!clinic) throw new Error("Clínica não encontrada para o admin");

    const doctorRole = await prisma.role.findFirst({
      where: { description: "Médico" },
    });

    if (!doctorRole) throw new Error("Role 'Médico' não encontrado");

    const created: string[] = [];

    for (let i = 1; i <= 30; i++) {
      const name = `Dr. Teste ${i}`;
      const email = `dr.teste.${i}@test.squad`;

      let user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            id: randomUUID(),
            name,
            email,
            emailVerified: true,
          },
        });
      }

      const existingProfessional = await prisma.professional.findFirst({
        where: { userId: user.id, clinicId: clinic.id },
      });

      if (!existingProfessional) {
        await prisma.professional.create({
          data: {
            id: randomUUID(),
            userId: user.id,
            clinicId: clinic.id,
            specialty: i % 2 === 0 ? "Clínica geral" : "Ortopedia",
            services: ["Consulta", "Retorno"],
          },
        });

        const existingMember = await prisma.clinicMember.findFirst({
          where: { userId: user.id, clinicId: clinic.id },
        });

        if (!existingMember) {
          await prisma.clinicMember.create({
            data: {
              id: randomUUID(),
              userId: user.id,
              clinicId: clinic.id,
              roleId: doctorRole.id,
            },
          });
        }

        created.push(name);
        console.log(`Criado: ${name} <${email}>`);
      } else {
        console.log(`Já existe: ${name} <${email}>`);
      }
    }

    console.log(`\nCriação finalizada. Novos profissionais criados: ${created.length}`);
  } catch (err) {
    console.error("Erro ao criar profissionais:", err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
