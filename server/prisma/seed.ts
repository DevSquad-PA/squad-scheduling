// ajuste o caminho conforme seu projeto
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

    let user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: randomUUID(),
          name: "usuario admin",
          email: userEmail,
          emailVerified: true,
          cpf: "12345678901",
          phone: "11987654321",
          dateOfBirth: new Date("1992-08-15"),
        },
      });
      console.log(`→ Usuário criado: ${user.email} (ID: ${user.id})`);
    } else {
      console.log(`→ Usuário já existe: ${user.email} (ID: ${user.id})`);
    }

    const hashedPassword =
      "7158bac61417c008f141842d091be207:388823e4e77324088868778d0ad03f3e19f4c56408b26b337ce9bb85eb1787d81362e429773a220e2b3ffa692e5143afc5b0c11d7e044438b5060f80c4f3ba68";

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
          password: hashedPassword,
          scope: "profile email",
        },
      });
      console.log(`→ Conta credentials criada`);
    } else {
      console.log(`→ Conta credentials já existe`);
    }

    let clinic = await prisma.clinic.findFirst({
      where: { name: "Clínica de Testes Squad" },
    });

    if (!clinic) {
      clinic = await prisma.clinic.create({
        data: {
          id: randomUUID(),
          name: "Clínica de Testes Squad",
        },
      });
      console.log(`→ Clínica criada: ${clinic.name} (ID: ${clinic.id})`);
    } else {
      console.log(`→ Clínica já existe: ${clinic.name} (ID: ${clinic.id})`);
    }

    let adminRole = await prisma.role.findFirst({
      where: { description: "Administrador" },
    });

    if (!adminRole) {
      adminRole = await prisma.role.create({
        data: {
          id: randomUUID(),
          description: "Administrador",
        },
      });
      console.log(`→ Cargo "Administrador" criado (ID: ${adminRole.id})`);
    } else {
      console.log(`→ Cargo "Administrador" já existe (ID: ${adminRole.id})`);
    }

    const existingMember = await prisma.clinicMember.findFirst({
      where: {
        userId: user.id,
        clinicId: clinic.id,
      },
    });

    if (!existingMember) {
      await prisma.clinicMember.create({
        data: {
          id: randomUUID(),
          userId: user.id,
          clinicId: clinic.id,
          roleId: adminRole.id,
        },
      });
      console.log("→ Admin vinculado à clínica como membro");
    } else {
      console.log("→ Admin já está vinculado à clínica");
    }

    console.log("\n→ Populando tabela Professional com 15 médicos...");

    const doctorsData = [
      {
        name: "Dr. Carlos Mendes",
        specialty: "Cardiologia",
        services: [
          "Consulta Cardiológica",
          "Eletrocardiograma",
          "Ecocardiograma",
        ],
      },
      {
        name: "Dra. Ana Beatriz Silva",
        specialty: "Pediatria",
        services: [
          "Consulta Pediátrica",
          "Vacinação",
          "Acompanhamento do Desenvolvimento",
        ],
      },
      {
        name: "Dr. Rafael Oliveira",
        specialty: "Ortopedia e Traumatologia",
        services: ["Consulta Ortopédica", "Imobilização", "Infiltração"],
      },
      {
        name: "Dra. Juliana Costa",
        specialty: "Ginecologia e Obstetrícia",
        services: ["Consulta Ginecológica", "Pré-natal", "Ultrassonografia"],
      },
      {
        name: "Dr. Marcos Vinicius Santos",
        specialty: "Dermatologia",
        services: ["Consulta Dermatológica", "Biópsia", "Crioterapia"],
      },
      {
        name: "Dra. Fernanda Lima",
        specialty: "Neurologia",
        services: ["Consulta Neurológica", "Eletroneuromiografia", "EEG"],
      },
      {
        name: "Dr. Roberto Almeida",
        specialty: "Oftalmologia",
        services: [
          "Consulta Oftalmológica",
          "Exame de Fundo de Olho",
          "Refração",
        ],
      },
      {
        name: "Dra. Patrícia Ferreira",
        specialty: "Psiquiatria",
        services: [
          "Consulta Psiquiátrica",
          "Terapia Cognitivo-Comportamental",
          "Acompanhamento Medicamentoso",
        ],
      },
      {
        name: "Dr. Lucas Henrique Souza",
        specialty: "Endocrinologia",
        services: [
          "Consulta Endocrinológica",
          "Diabetes",
          "Distúrbios da Tireoide",
        ],
      },
      {
        name: "Dra. Mariana Rocha",
        specialty: "Oncologia",
        services: [
          "Consulta Oncológica",
          "Acompanhamento Quimioterápico",
          "Cuidados Paliativos",
        ],
      },
      {
        name: "Dr. Eduardo Ribeiro",
        specialty: "Gastroenterologia",
        services: ["Consulta Gastrenterológica", "Endoscopia", "Colonoscopia"],
      },
      {
        name: "Dra. Camila Martins",
        specialty: "Pneumologia",
        services: [
          "Consulta Pneumológica",
          "Espirometria",
          "Teste de Função Pulmonar",
        ],
      },
      {
        name: "Dr. Thiago Barros",
        specialty: "Urologia",
        services: ["Consulta Urológica", "Ultrassonografia", "Prostatectomia"],
      },
      {
        name: "Dra. Letícia Nunes",
        specialty: "Reumatologia",
        services: [
          "Consulta Reumatológica",
          "Artrite Reumatoide",
          "Osteoporose",
        ],
      },
      {
        name: "Dr. André Felipe Costa",
        specialty: "Otorrinolaringologia",
        services: ["Consulta Otorrino", "Audiometria", "Endoscopia Nasal"],
      },
    ];

    for (const doc of doctorsData) {
      const email = `${doc.name
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, ".")
        .replace(/\.{2,}/g, ".")}@squadscheduling.local`;

      let doctorUser = await prisma.user.findUnique({ where: { email } });

      if (!doctorUser) {
        doctorUser = await prisma.user.create({
          data: {
            id: randomUUID(),
            name: doc.name,
            email,
            emailVerified: true,
            cpf: Math.floor(
              10000000000 + Math.random() * 90000000000,
            ).toString(),
            phone: `119${Math.floor(10000000 + Math.random() * 90000000)}`,
            dateOfBirth: new Date(
              1975 + Math.floor(Math.random() * 25),
              Math.floor(Math.random() * 12),
              15,
            ),
          },
        });
      }

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
            services: doc.services,
          },
        });
        console.log(`✓ ${doc.name} → ${doc.specialty}`);
      } else {
        console.log(`→ ${doc.name} já existe como Professional`);
      }
    }

    console.log("\n→ Criando 30 pacientes com agendamentos...");

    const professionals = await prisma.professional.findMany({
      where: { clinicId: clinic.id },
    });

    function getRandomDate(start: Date, end: Date) {
      return new Date(
        start.getTime() + Math.random() * (end.getTime() - start.getTime()),
      );
    }

    function getRandomTime() {
      const hour = Math.floor(Math.random() * (18 - 8) + 8); // entre 08h e 18h
      const minutes = [0, 15, 30, 45][Math.floor(Math.random() * 4)];

      const time = new Date();
      time.setHours(hour, minutes, 0, 0);
      return time;
    }

    const startDate = new Date("2026-04-06");
    const endDate = new Date("2026-04-20");

    for (let i = 1; i <= 30; i++) {
      const email = `paciente${i}@squadscheduling.local`;

      let patientUser = await prisma.user.findUnique({ where: { email } });

      if (!patientUser) {
        patientUser = await prisma.user.create({
          data: {
            id: randomUUID(),
            name: `Paciente ${i}`,
            email,
            emailVerified: true,
            cpf: Math.floor(
              10000000000 + Math.random() * 90000000000,
            ).toString(),
            phone: `119${Math.floor(10000000 + Math.random() * 90000000)}`,
            dateOfBirth: new Date(
              1980 + Math.floor(Math.random() * 30),
              Math.floor(Math.random() * 12),
              10,
            ),
          },
        });
      }

      let patient = await prisma.patient.findFirst({
        where: {
          userId: patientUser.id,
          clinicId: clinic.id,
        },
      });

      if (!patient) {
        patient = await prisma.patient.create({
          data: {
            id: randomUUID(),
            userId: patientUser.id,
            clinicId: clinic.id,
          },
        });
      }

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
          date: getRandomDate(startDate, endDate),
          time: getRandomTime(),
          services: [service],
        },
      });

      console.log(`✓ Paciente ${i} agendado`);
    }

    console.log("\n═══════════════════════════════════════════════");
    console.log("Seed concluído com sucesso!");
    console.log("Email Admin →", userEmail);
    console.log("Senha       → Admin@123");
    console.log("Clínica     → Clínica de Testes Squad");
    console.log(
      "15 profissionais médicos foram inseridos na tabela Professional.",
    );
    console.log("═══════════════════════════════════════════════\n");
  } catch (err) {
    console.error("Erro durante o seed:");
    console.error(err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();
