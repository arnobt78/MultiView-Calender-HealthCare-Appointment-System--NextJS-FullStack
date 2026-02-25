/**
 * Prisma client singleton for server-side use only.
 * Use in API routes and Server Components; keeps CRUD on the server for performance.
 * Prisma 6: uses DATABASE_URL from env (Next.js loads .env.local in dev).
 */

import { PrismaClient } from "@/generated/prisma";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrisma() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
