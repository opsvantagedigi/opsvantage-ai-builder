import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { logger } from "./logger"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const databaseUrl =
  process.env.DATABASE_URL ||
  "postgresql://placeholder:placeholder@localhost:5432/placeholder?sslmode=require";

const adapter = new PrismaNeon({ connectionString: databaseUrl });

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  })

// Add connection monitoring/logging for dev
if (process.env.NODE_ENV === "development") {
   // Middleware to log queries strictly can be added here if needed via $extends
   // But standard log array is enough for now.
   // We can add a simple "check" log on init
   logger.info("Prisma Client initialized");
}

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}

export async function withRetry<T>(
  operation: () => Promise<T>, 
  maxRetries = 3, 
  delay = 100
): Promise<T> {
  let lastError: unknown;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error: unknown) {
      lastError = error;

      // Check for transient errors (connection closed, timeout, etc.)
      const errAny = error as { code?: string; message?: string } | undefined;
      const isTransient =
        errAny?.code === 'P1001' || // Can't reach DB
        errAny?.code === 'P1002' || // Timeout
        errAny?.code === 'P1008' || // Operation timeout
        errAny?.code === 'P1017' || // Server closed connection
        errAny?.message?.includes('connection closed') ||
        errAny?.message?.includes('Client has already been released');

      if (!isTransient || i === maxRetries - 1) {
        throw error;
      }

      const retryDelay = delay * Math.pow(2, i); // Exponential backoff
      logger.warn(`Database operation failed, retrying (${i + 1}/${maxRetries}). Error: ${String(errAny?.message ?? errAny)}, Retry delay: ${retryDelay}ms`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
  
  throw lastError;
}