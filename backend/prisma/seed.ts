import 'dotenv/config'
import { PrismaClient, Role } from "../generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
});

const prisma = new PrismaClient({ adapter });

const emailAdmin = process.env.MASTER_ADMIN_EMAIL;
const passwordAdmin = process.env.MASTER_ADMIN_PASSWORD;

async function main() {
  const senhaHash = await bcrypt.hash(passwordAdmin ?? "admin123", 10);

  const admin = await prisma.user.upsert({
    where: { email: emailAdmin ?? "admin@saude.com" },
    update: {},
    create: {
      nome: "Administrador",
      email: emailAdmin ?? "admin@saude.com",
      password: senhaHash,
      cpf: "99999999999",
      nascimento: new Date("1990-01-01"),
      fone: "00000000000",
      role: Role.ADMIN,
    }
  });

  console.log("Admin criado:", admin.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());