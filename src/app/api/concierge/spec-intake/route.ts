import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const specIntakeSchema = z.object({
  brandName: z.string().trim().min(2).max(120),
  targetAudience: z.string().trim().min(2).max(240),
  visualStyle: z.enum(["Minimal", "Bold", "Classic"]),
  requiredFeatures: z.string().trim().min(5).max(5000),
});

async function ensureProjectLeadsTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "ProjectLeads" (
      "id" TEXT PRIMARY KEY,
      "brandName" TEXT NOT NULL,
      "targetAudience" TEXT NOT NULL,
      "visualStyle" TEXT NOT NULL,
      "requiredFeatures" TEXT NOT NULL,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

export async function POST(request: Request) {
  try {
    const payload = specIntakeSchema.parse(await request.json());

    await ensureProjectLeadsTable();

    const leadId = randomUUID();
    await prisma.$executeRawUnsafe(
      `
        INSERT INTO "ProjectLeads"
          ("id", "brandName", "targetAudience", "visualStyle", "requiredFeatures", "createdAt")
        VALUES
          ($1, $2, $3, $4, $5, NOW())
      `,
      leadId,
      payload.brandName,
      payload.targetAudience,
      payload.visualStyle,
      payload.requiredFeatures
    );

    return NextResponse.json({ ok: true, leadId });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, errors: error.flatten() }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : String(error);
    if (/DATABASE_URL|Can't reach database server|ClientInitializationError/i.test(message)) {
      return NextResponse.json(
        { ok: false, error: "Database unavailable. Please configure DATABASE_URL." },
        { status: 503 }
      );
    }

    return NextResponse.json({ ok: false, error: "Failed to save intake." }, { status: 500 });
  }
}
