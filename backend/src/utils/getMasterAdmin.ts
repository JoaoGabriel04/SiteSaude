import { prisma } from "../lib/prisma.js";

let cachedAdminId: string | null = null;

export async function getMasterAdminId(): Promise<string> {
  if (cachedAdminId) return cachedAdminId;

  const email = process.env.MASTER_ADMIN_EMAIL ?? "admin@saude.com";
  const admin = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (!admin) {
    throw new Error(
      `Master admin não encontrado (email: ${email}). Rode 'npx prisma db seed'.`
    );
  }

  cachedAdminId = admin.id;
  return admin.id;
}