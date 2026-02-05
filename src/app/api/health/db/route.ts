import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withErrorHandling } from "@/lib/api-error";
import { logger } from "@/lib/logger";

async function handler(req: Request) {
  // Check Prisma connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    logger.info("Health Check: DB Connection OK");
    return NextResponse.json({ 
        status: "ok", 
        database: "connected", 
        timestamp: new Date().toISOString() 
    });
  } catch (error: any) {
    logger.error({ msg: "Health Check: DB Connection Failed", error: error.message });
    return NextResponse.json(
      { status: "error", database: "disconnected", error: error.message },
      { status: 503 }
    );
  }
}

export const GET = withErrorHandling(handler);
