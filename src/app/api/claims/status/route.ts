import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { applyRateLimit } from "@/lib/rate-limit";
import { getOfferStatus, isFoundersOfferId } from "@/lib/claims-counter";

export async function GET(req: NextRequest) {
  const rate = await applyRateLimit(req, { keyPrefix: "api:claims:status", limit: 60, windowMs: 60_000 });
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many requests." },
      { status: 429, headers: { "Retry-After": `${rate.retryAfterSeconds}` } }
    );
  }

  const { searchParams } = new URL(req.url);
  const offerId = searchParams.get("offerId");

  if (!offerId) {
    // Default: only the headline scarcity offer.
    const sovereign = await getOfferStatus("sovereign-25");
    return NextResponse.json({ offers: { [sovereign.offerId]: sovereign } }, { status: 200 });
  }

  if (!isFoundersOfferId(offerId)) {
    return NextResponse.json({ error: "Invalid offerId." }, { status: 400 });
  }

  try {
    const status = await getOfferStatus(offerId);
    return NextResponse.json({ offers: { [status.offerId]: status } }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load claim status.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
