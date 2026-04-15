import { PrismaClient } from "../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  try {
    const rawTables = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema='public'`;
    console.log("Tabelas no DB:", rawTables);
    
    // Check if usr_accounts has any rows for admin@email.com
    const accountRows = await prisma.$queryRaw`SELECT * FROM usr_accounts WHERE user_id = (SELECT id_user FROM usr_users WHERE email = 'admin@email.com')`;
    console.log("Accounts row:", accountRows);

  } catch(e) {
    console.error("Erro banco:", e);
  } finally {
    await prisma.$disconnect()
  }
}
main();
