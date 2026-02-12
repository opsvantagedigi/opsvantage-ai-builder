import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { applyRateLimit } from "@/lib/rate-limit";
import { getOfferStatus } from "@/lib/claims-counter";
import { openProvider } from "@/lib/openprovider/client";

function isAdminEmail(email?: string | null) {
  if (!email) return false;

  const allowList = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  return allowList.length > 0 && allowList.includes(email.toLowerCase());
}

async function checkOpenProviderHealth() {
  try {
    await Promise.race([
      openProvider.getLicenseItems(),
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 4000)),
    ]);
    return "green" as const;
  } catch {
    return "red" as const;
  }
}

export async function GET(req: NextRequest) {
  const rate = applyRateLimit(req, { keyPrefix: "api:admin:telemetry", limit: 60, windowMs: 60_000 });
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many requests." },
      { status: 429, headers: { "Retry-After": `${rate.retryAfterSeconds}` } }
    );
  }

  const sovereignCookie = req.cookies.get("zenith_admin_token")?.value;
  const isSovereign = Boolean(sovereignCookie);

  if (!isSovereign) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "dev-nextauth-secret" });
    const email = (token as any)?.email as string | undefined;
    if (!isAdminEmail(email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const [wholesaleStatus, savingsAggregate, marzRows, apiStatus] = await Promise.all([
    getOfferStatus("wholesale-ghost"),
    prisma.foundersClaim.aggregate({ _sum: { savedAmount: true } }),
    prisma.marzMemory.findMany({
      select: { insight: true, category: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    checkOpenProviderHealth(),
  ]);

  const fallbackThoughts = [
    { category: "Observation", insight: "Detected search for .ai domain." },
    { category: "Rationalization", insight: "User is building an AI-centric estate. SSL is mandatory for trust." },
    { category: "Action Taken", insight: "Pre-selected Premium EV SSL in the background worker." },
    { category: "Economic Impact", insight: "Saved user $214.00 vs. GoDaddy retail." },
  ];

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    sovereign25SlotsRemaining: wholesaleStatus.remaining ?? 0,
    totalEstimatedCustomerSavings: Number((savingsAggregate._sum.savedAmount ?? 0).toFixed(2)),
    openProviderStatus: apiStatus,
    marzThoughts:
      marzRows.length > 0
        ? marzRows.map((row) => ({
            category: row.category,
            insight: row.insight,
            createdAt: row.createdAt,
          }))
        : fallbackThoughts,
  });
}
