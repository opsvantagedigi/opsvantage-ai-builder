import { NextResponse } from "next/server";

import { FOUNDERS_LIMITS, getOfferStatus } from "@/lib/claims-counter";

export async function GET() {
  const offerIds = Object.keys(FOUNDERS_LIMITS) as Array<keyof typeof FOUNDERS_LIMITS>;
  const statuses = await Promise.all(offerIds.map((offerId) => getOfferStatus(offerId)));

  // Primary scarcity driver is the Wholesale Ghost per Sovereign 25.
  const wholesale = statuses.find((s) => s.offerId === "wholesale-ghost");

  const counterBadgeText = wholesale?.limit
    ? `Only ${wholesale.remaining ?? 0}/${wholesale.limit} Founding Estate spots remaining.`
    : null;

  return NextResponse.json(
    {
      offers: statuses,
      counterBadgeText,
    },
    { status: 200 }
  );
}
