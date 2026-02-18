import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { applyRateLimit } from "@/lib/rate-limit";
import {
  createOfferClaim,
  type FoundersOfferId,
  FOUNDERS_LIMITS,
  hashFingerprint,
  isFoundersOfferId,
} from "@/lib/claims-counter";

function getClientIp(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || null;
  }
  return req.headers.get("x-real-ip") ?? null;
}

export async function POST(req: NextRequest) {
  const rate = await applyRateLimit(req, { keyPrefix: "api:claims:claim", limit: 30, windowMs: 60_000 });
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many requests." },
      { status: 429, headers: { "Retry-After": `${rate.retryAfterSeconds}` } }
    );
  }

  try {
    const body = (await req.json()) as { offerId?: FoundersOfferId };
    const offerId = body.offerId;

    if (!offerId) {
      return NextResponse.json({ error: "offerId is required." }, { status: 400 });
    }

    if (!isFoundersOfferId(offerId)) {
      return NextResponse.json({ error: "Invalid offerId." }, { status: 400 });
    }

    const limit = FOUNDERS_LIMITS[offerId];
    if (Number.isFinite(limit) && limit <= 0) {
      return NextResponse.json({ error: "Offer is not claimable." }, { status: 400 });
    }

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "dev-nextauth-secret" });
    const ip = getClientIp(req);
    const userAgent = req.headers.get("user-agent") ?? "";
    const userId = (token as any)?.sub ?? null;
    const fingerprint =
      (userId ? `user:${userId}` : hashFingerprint(`${ip ?? ""}|${userAgent}`)) ??
      "anon:unknown";

    const status = await createOfferClaim({
      offerId,
      userId,
      fingerprint,
    });

    return NextResponse.json({ status }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to record claim.";
    const conflict = message === "Offer is fully claimed." || message === "You have already claimed this offer.";
    return NextResponse.json({ error: message }, { status: conflict ? 409 : 500 });
  }
}
