/**
 * Prisma Client Singleton
 * Prevents multiple instances in development (hot reload).
 * Gracefully handles missing DATABASE_URL.
 */
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | null };

let prisma: PrismaClient | null = null;

if (process.env.DATABASE_URL) {
  prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });

  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
} else {
  console.warn("⚠️ DATABASE_URL not set — Prisma client not initialized. Operational features will use fallback storage.");
}

export { prisma };
export default prisma;
