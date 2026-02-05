import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { Pool, neonConfig } from "@neondatabase/serverless"
import ws from "ws"
import { logger } from "./logger"

neonConfig.webSocketConstructor = ws

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  logger.fatal("DATABASE_URL is not set");
  throw new Error("DATABASE_URL is not set")
}

const adapter = new PrismaNeon({ connectionString })

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

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
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // Check for transient errors (connection closed, timeout, etc.)
      const isTransient = 
        error?.code === 'P1001' || // Can't reach DB
        error?.code === 'P1002' || // Timeout
        error?.code === 'P1008' || // Operation timeout
        error?.code === 'P1017' || // Server closed connection
        error?.message?.includes('connection closed') ||
        error?.message?.includes('Client has already been released');

      if (!isTransient || i === maxRetries - 1) {
        throw error;
      }
      
      const retryDelay = delay * Math.pow(2, i); // Exponential backoff
      logger.warn({ msg: `Database operation failed, retrying (${i + 1}/${maxRetries})`, error: error.message, retryDelay });
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
  
  throw lastError;
}