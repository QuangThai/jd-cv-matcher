import { PrismaClient } from "../../../generated/prisma";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { isDbDisabled } from "@/lib/env";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaLibSql({
    url: process.env.DATABASE_URL ?? "file:./dev.db",
  });
  return new PrismaClient({ adapter });
}

/**
 * Prisma client instance.
 *
 * When DISABLE_DB_FEATURES is true (Vercel production), any operation
 * on prisma immediately throws a descriptive error. The app's core
 * analysis flow does not touch prisma, so that path works fine.
 */
export const prisma = isDbDisabled
  ? (new Proxy(
      {},
      {
        get(_, prop) {
          return () => {
            throw new Error(
              "Database features are disabled in this environment. " +
                "Analysis and results work normally, but saving to history, " +
                "authentication, and account features are unavailable.",
            );
          };
        },
      },
    ) as PrismaClient)
  : (globalForPrisma.prisma ?? createPrismaClient());

if (!isDbDisabled && process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma as PrismaClient;
}
