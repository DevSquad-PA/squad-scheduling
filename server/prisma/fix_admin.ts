import { PrismaPg } from "@prisma/adapter-pg";
import crypto from "crypto";

import { PrismaClient } from "../../generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  try {
    const adminUser = await prisma.user.findFirst({
      where: { email: "admin@email.com" }
    });

    if (!adminUser) {
      console.log("admin@email.com não encontrado!");
      return;
    }

    const hashedPassword = "7158bac61417c008f141842d091be207:388823e4e77324088868778d0ad03f3e19f4c56408b26b337ce9bb85eb1787d81362e429773a220e2b3ffa692e5143afc5b0c11d7e044438b5060f80c4f3ba68";

    const newAccount = await prisma.account.create({
      data: {
        id: crypto.randomUUID(),
        accountId: adminUser.id,
        providerId: "credential",
        userId: adminUser.id,
        password: hashedPassword,
        scope: "profile email",
      }
    });

    console.log("Senha Admin@123 vinculada com sucesso ao admin@email.com!");
  } catch(e) {
    console.error("Erro banco:", e);
  } finally {
    await prisma.$disconnect()
  }
}
main();
