import crypto from "crypto";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

import { claimOffer, FoundersOfferId, SOLD_OUT_REPLACEMENT } from "@/lib/claims-counter";

function safeString(value: unknown, maxLen: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLen);
}

function hash(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "";
  }
  return req.headers.get("x-real-ip") ?? "";
}

function offerPayload(offerId: FoundersOfferId) {
  switch (offerId) {
    case "estate-founder":
      return {
        id: "estate-founder",
        name: "The Estate Founder",
        description: "A .com registration for $0.99",
        savings: 95,
        duration: undefined,
      };
    case "wholesale-ghost":
      return {
        id: "wholesale-ghost",
        name: "The Wholesale Ghost",
        description: "0% markup on all products for 12 months",
        savings: 100,
        duration: "12 months",
      };
    case "architect-choice":
      return {
        id: "architect-choice",
        name: "Architect's Choice",
        description: "Free SpamExpert and Standard SSL for life of domain",
        savings: 100,
        duration: "Life of domain",
      };
    case "zenith-discount-15":
    default:
      return {
        id: "zenith-discount-15",
        name: "15% Zenith Discount",
        description: "A standard launch discount once Founders inventory is claimed.",
        savings: 15,
        duration: undefined,
      };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { offerId?: unknown };
    const offerIdRaw = safeString(body.offerId, 64) as FoundersOfferId;

    const allowed: FoundersOfferId[] = ["estate-founder", "wholesale-ghost", "architect-choice", "zenith-discount-15"];
    if (!allowed.includes(offerIdRaw)) {
      return NextResponse.json({ error: "Invalid offerId" }, { status: 400 });
    }

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "dev-nextauth-secret" });
    const userId = typeof token?.sub === "string" ? token.sub : undefined;

    const ip = getClientIp(req);
    const ua = req.headers.get("user-agent") ?? "";
    const fingerprint = userId ? `user:${userId}` : `anon:${hash(`${ip}|${ua}`)}`;

    // Impact estimates (USD) for grants/pitches. Keep conservative.
    let competitorPrice: number | undefined;
    let zenithPrice: number | undefined;
    let savedAmount: number | undefined;

    if (offerIdRaw === "estate-founder") {
      competitorPrice = 21.99;
      zenithPrice = 0.99;
      savedAmount = Math.max(0, competitorPrice - zenithPrice);
    }

    const claim = await claimOffer({
      offerId: offerIdRaw,
      fingerprint,
      userId,
      competitorPrice,
      zenithPrice,
      savedAmount,
      currency: "USD",
    });

    const awardedOfferId = claim.awardedOfferId;

    return NextResponse.json(
      {
        awardedOffer: offerPayload(awardedOfferId),
        replaced: claim.replaced,
        soldOutReplacement: SOLD_OUT_REPLACEMENT,
        status: claim.status,
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to claim offer";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
