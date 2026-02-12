import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withErrorHandling } from "@/lib/api-error";
import { logger } from "@/lib/logger";

async function handler(req: Request) {
  if (process.env.NEXT_PHASE === "phase-production-build" || process.env.SKIP_DB_CHECK_DURING_BUILD === "true") {
    return NextResponse.json({ status: "SKIPPED_DURING_BUILD" });
  }

  // Check Prisma connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    logger.info("Health Check: DB Connection OK");
    return NextResponse.json({ 
        status: "ok", 
        database: "connected", 
        timestamp: new Date().toISOString() 
    });
  } catch (error: unknown) {
    const e = error as Error
    logger.error(`Health Check: DB Connection Failed. Error: ${e.message}`);
    return NextResponse.json(
      { status: "error", database: "disconnected", error: e.message },
      { status: 503 }
    );
  }
}

export const GET = withErrorHandling(handler);
