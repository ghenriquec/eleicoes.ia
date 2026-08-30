import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Singleton do Prisma Client (padrão Next.js — evita esgotar conexões em dev
 * com hot-reload). Prisma 7 usa driver adapters: a URL de conexão é lida uma
 * única vez aqui, nunca espalhada pelo código de domínio.
 */
declare global {
  var __prisma: PrismaClient | undefined;
}

function createClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

export const prisma = globalThis.__prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}
