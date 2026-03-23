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
    const password = "Admin@123"
    
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

    const hashedPassword = "7158bac61417c008f141842d091be207:388823e4e77324088868778d0ad03f3e19f4c56408b26b337ce9bb85eb1787d81362e429773a220e2b3ffa692e5143afc5b0c11d7e044438b5060f80c4f3ba68";

    const existingAccount = await prisma.account.findFirst({
      where: {
        providerId: "credential",
        userId: user.id,
      },
    });

    let account;

    if (!existingAccount) {
      account = await prisma.account.create({
        data: {
          id: randomUUID(),
          accountId: user.id,
          providerId: "credential",
          userId: user.id,
          password: hashedPassword,
          scope: "profile email",
        },
      });
      console.log(`→ Conta credentials criada (accountId = ${account.accountId})`);
    } else {
      account = existingAccount;
      console.log(`→ Conta credentials já existe (accountId = ${account.accountId})`);
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
      console.log("→ Usuário vinculado como ADMINISTRADOR da clínica");
    } else {
      console.log("→ Usuário já está vinculado à clínica (skip)");
    }

    console.log("\n═══════════════════════════════════════════════");
    console.log("Seed concluído com sucesso!");
    console.log("Use estas credenciais para testar o login:");
    console.log("  Email    →", userEmail);
    console.log("  Senha    → Admin@123   (ou a senha que gera o hash acima)");
    console.log("  Clínica  →", clinic.name);
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