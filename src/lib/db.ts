import { PrismaClient } from "@/generated/prisma/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalForPrisma = globalThis as unknown as { _prisma: any };

export function getDb() {
  if (!globalForPrisma._prisma) {
    // @ts-expect-error Prisma v7 client constructor
    globalForPrisma._prisma = new PrismaClient();
  }
  return globalForPrisma._prisma;
}
