import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { FoundersOfferId } from "@/lib/claims-counter";
import { applyRateLimit } from "@/lib/rate-limit";

function isAdminEmail(email?: string | null) {
  if (!email) return false;

  const allowList = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  if (allowList.length === 0) return false;
  return allowList.includes(email.toLowerCase());
}

const ESTIMATED_SAVINGS_USD: Readonly<Partial<Record<FoundersOfferId, number>>> = {
  // Conservative, fixed estimates (kept intentionally simple for investor/ops visibility).
  "estate-founder": 21.0,
  "architect-choice": 279.99,
  "wholesale-ghost": 0,
  "zenith-discount-15": 0,
};

export async function GET(req: NextRequest) {
  const rate = applyRateLimit(req, { keyPrefix: "api:admin:impact-report", limit: 30, windowMs: 60_000 });
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many requests." },
      { status: 429, headers: { "Retry-After": `${rate.retryAfterSeconds}` } }
    );
  }

  const sovereignCookie = req.cookies.get("zenith_admin_token")?.value;
  if (!sovereignCookie) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "dev-nextauth-secret" });
    const email = (token as any)?.email as string | undefined;

    if (!isAdminEmail(email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let rows: Array<{ offerId: string; _count: { offerId: number } }> = [];
  try {
    rows = await prisma.foundersClaim.groupBy({
      by: ["offerId"],
      _count: { offerId: true },
    });
  } catch (error) {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021")) {
      throw error;
    }
  }

  const offers = rows
    .map((r) => {
      const offerId = r.offerId as FoundersOfferId;
      const claims = r._count.offerId;
      const perClaim = ESTIMATED_SAVINGS_USD[offerId] ?? 0;
      const estimatedSavingsUsd = Number((perClaim * claims).toFixed(2));

      return {
        offerId,
        claims,
        estimatedSavingsUsd,
      };
    })
    .sort((a, b) => b.claims - a.claims);

  const totalClaims = offers.reduce((sum, o) => sum + o.claims, 0);
  const totalSavingsUsd = Number(
    offers.reduce((sum, o) => sum + o.estimatedSavingsUsd, 0).toFixed(2)
  );

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    totals: {
      totalClaims,
      totalSavingsUsd,
    },
    offers,
  });
}
