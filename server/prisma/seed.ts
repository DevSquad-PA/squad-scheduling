import { randomUUID } from "crypto";
import { PrismaClient } from "../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function seedDatabase() {
  try {
     console.log("Iniciando seed de dados de desenvolvimento...");

    const userEmail = "dev@squadscheduling.local";
    const password = "Admin@123";
    // =====================================================
    // ADMIN
    // =====================================================

    let user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: randomUUID(),
          name: "Admin",
          email: userEmail,
          emailVerified: true,
        },
      });

      console.log("✔ Admin criado");
    }

    // =====================================================
    // ACCOUNT
    // =====================================================

    const existingAccount = await prisma.account.findFirst({
      where: {
        providerId: "credential",
        userId: user.id,
      },
    });

    if (!existingAccount) {
      await prisma.account.create({
        data: {
          id: randomUUID(),
          accountId: user.id,
          providerId: "credential",
          userId: user.id,
          password:
            "7158bac61417c008f141842d091be207:388823e4e77324088868778d0ad03f3e19f4c56408b26b337ce9bb85eb1787d81362e429773a220e2b3ffa692e5143afc5b0c11d7e044438b5060f80c4f3ba68",
        },
      });

      console.log("Conta credentials criada");
    }

    // =====================================================
    // ROLES
    // =====================================================

    const adminRole = await prisma.role.upsert({
      where: { description: "Administrador" },
      update: {},
      create: {
        id: randomUUID(),
        description: "Administrador",
      },
    });

    const doctorRole = await prisma.role.upsert({
      where: { description: "Médico" },
      update: {},
      create: {
        id: randomUUID(),
        description: "Médico",
      },
    });

    // =====================================================
    // CLINIC
    // =====================================================

    let clinic = await prisma.clinic.findFirst({
      where: {
        members: {
          some: {
            userId: user.id,
          },
        },
      },
    });

    if (!clinic) {
      clinic = await prisma.clinic.create({
        data: {
          id: randomUUID(),
          name: "Clínica de Testes Squad",
          members: {
            create: {
              id: randomUUID(),
              userId: user.id,
              roleId: adminRole.id,
            },
          },
        },
      });

      console.log("Clínica criada");
    }

    // garantir que admin está vinculado (caso clinic já existisse)
    const adminMember = await prisma.clinicMember.findFirst({
      where: {
        userId: user.id,
        clinicId: clinic.id,
      },
    });

    if (!adminMember) {
      await prisma.clinicMember.create({
        data: {
          id: randomUUID(),
          userId: user.id,
          clinicId: clinic.id,
          roleId: adminRole.id,
        },
      });
    }

    // =====================================================
    // PROFISSIONAIS + MEMBERS
    // =====================================================

    const doctors = [
      { name: "Dr. Carlos Mendes", specialty: "Cardiologia" },
      { name: "Dra. Ana Silva", specialty: "Pediatria" },
      { name: "Dr. Rafael Oliveira", specialty: "Ortopedia" },
      { name: "Dra. Juliana Costa", specialty: "Ginecologia" },
      { name: "Dr. Marcos Santos", specialty: "Dermatologia" },
    ];

    for (const doc of doctors) {
      const email = `${doc.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, ".")}@mail.com`;

      let doctorUser = await prisma.user.findUnique({
        where: { email },
      });

      if (!doctorUser) {
        doctorUser = await prisma.user.create({
          data: {
            id: randomUUID(),
            name: doc.name,
            email,
            emailVerified: true,
          },
        });
      }

      // PROFESSIONAL
      let professional = await prisma.professional.findFirst({
        where: {
          userId: doctorUser.id,
          clinicId: clinic.id,
        },
      });

      if (!professional) {
        professional = await prisma.professional.create({
          data: {
            id: randomUUID(),
            userId: doctorUser.id,
            clinicId: clinic.id,
            specialty: doc.specialty,
            services: ["Consulta", "Retorno"],
          },
        });

        console.log(`✔ ${doc.name} (Professional)`);
      }

      const existingMember = await prisma.clinicMember.findFirst({
        where: {
          userId: doctorUser.id,
          clinicId: clinic.id,
        },
      });

      if (!existingMember) {
        await prisma.clinicMember.create({
          data: {
            id: randomUUID(),
            userId: doctorUser.id,
            clinicId: clinic.id,
            roleId: doctorRole.id,
          },
        });

        console.log(`🔗 ${doc.name} vinculado como MÉDICO`);
      }
    }

    // =====================================================
    // AGENDAMENTOS
    // =====================================================

    const professionals = await prisma.professional.findMany({
      where: { clinicId: clinic.id },
    });

    function randomDate() {
      const start = new Date("2026-04-01").getTime();
      const end = new Date("2026-04-30").getTime();
      return new Date(start + Math.random() * (end - start));
    }

    function randomTime() {
      const hour = Math.floor(Math.random() * 10 + 8);
      const minutes = [0, 15, 30, 45][Math.floor(Math.random() * 4)];

      const d = new Date();
      d.setHours(hour, minutes, 0, 0);
      return d;
    }

    console.log("Criando pacientes + agendamentos...");

    for (let i = 1; i <= 30; i++) {
      const patient = await prisma.patient.create({
        data: {
          id: randomUUID(),
          clinicId: clinic.id,
        },
      });

      const professional =
        professionals[Math.floor(Math.random() * professionals.length)];

      const service =
        professional.services[
          Math.floor(Math.random() * professional.services.length)
        ];

      await prisma.appointment.create({
        data: {
          id: randomUUID(),
          clinicId: clinic.id,
          professionalId: professional.id,
          patientId: patient.id,
          date: randomDate(),
          time: randomTime(),
          services: [service],
        },
      });

      console.log(`Paciente ${i} agendado`);
    }

    // =====================================================
    console.log("\n═══════════════════════════════════════════════");
    console.log("Seed concluído com sucesso!");
        console.log("Email Admin →", userEmail);
        console.log("Senha       → Admin@123");
    console.log("Clínica:", clinic.name);
    console.log("Profissionais:", professionals.length);
    console.log("Agendamentos: 30");
  } catch (err) {
    console.error("Erro no seed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();