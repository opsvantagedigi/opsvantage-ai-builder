import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";

import { verifySession } from "@/lib/verify-session";
import { ensureSentinelMemory } from "@/lib/marz/sentinel-memory";

export async function POST(req: NextRequest) {
  try {
    const sovereignCookie = req.cookies.get("zenith_admin_token")?.value;
    const session = sovereignCookie ? null : await verifySession();

    if (!sovereignCookie && !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const seedResult = await ensureSentinelMemory(session?.sub ?? null);

    return NextResponse.json({ ok: true, seededCount: seedResult.seededCount });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
      return NextResponse.json({ ok: false, skipped: "MarzMemory table unavailable" }, { status: 200 });
    }

    const details = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Failed to seed MARZ memory", details }, { status: 500 });
  }
}
