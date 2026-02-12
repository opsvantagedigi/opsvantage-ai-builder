import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "dev-nextauth-secret" });
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [count, aggregate] = await Promise.all([
    db.foundersClaim.count(),
    db.foundersClaim.aggregate({
      _sum: { savedAmount: true },
    }),
  ]);

  const byOffer = await db.foundersClaim.groupBy({
    by: ["offerId"],
    _count: { _all: true },
    _sum: { savedAmount: true },
    orderBy: { offerId: "asc" },
  });

  return NextResponse.json(
    {
      totalClaims: count,
      totalSavedAmountUsd: aggregate._sum.savedAmount ?? 0,
      byOffer: byOffer.map((row) => ({
        offerId: row.offerId,
        claims: row._count._all,
        savedAmountUsd: row._sum.savedAmount ?? 0,
      })),
    },
    { status: 200 }
  );
}
