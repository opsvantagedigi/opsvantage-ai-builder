import crypto from "crypto";

import { db } from "@/lib/db";

export type FoundersOfferId = "estate-founder" | "wholesale-ghost" | "architect-choice" | "zenith-discount-15";

export const FOUNDERS_LIMITS: Record<Exclude<FoundersOfferId, "zenith-discount-15">, number> = {
  "estate-founder": 50,
  "wholesale-ghost": 25,
  "architect-choice": 25,
};

export const SOLD_OUT_REPLACEMENT: FoundersOfferId = "zenith-discount-15";

export type OfferStatus = {
  offerId: FoundersOfferId;
  limit: number | null;
  claimed: number;
  remaining: number | null;
  soldOut: boolean;
};

export type ClaimResult = {
  awardedOfferId: FoundersOfferId;
  replaced: boolean;
  status: OfferStatus;
};

export function hashFingerprint(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export async function getOfferStatus(offerId: FoundersOfferId): Promise<OfferStatus> {
  const limit = (FOUNDERS_LIMITS as Partial<Record<FoundersOfferId, number>>)[offerId] ?? null;
  const claimed = await db.foundersClaim.count({ where: { offerId } });

  if (!limit) {
    return { offerId, limit: null, claimed, remaining: null, soldOut: false };
  }

  const remaining = Math.max(0, limit - claimed);
  return { offerId, limit, claimed, remaining, soldOut: remaining <= 0 };
}

export async function claimOffer(params: {
  offerId: FoundersOfferId;
  fingerprint: string;
  userId?: string;
  competitorPrice?: number;
  zenithPrice?: number;
  savedAmount?: number;
  currency?: string;
}): Promise<ClaimResult> {
  const offerId = params.offerId;
  const limit = (FOUNDERS_LIMITS as Partial<Record<FoundersOfferId, number>>)[offerId];

  if (!limit) {
    return {
      awardedOfferId: offerId,
      replaced: false,
      status: { offerId, limit: null, claimed: 0, remaining: null, soldOut: false },
    };
  }

  const currentCount = await db.foundersClaim.count({ where: { offerId } });
  if (currentCount >= limit) {
    return {
      awardedOfferId: SOLD_OUT_REPLACEMENT,
      replaced: true,
      status: {
        offerId,
        limit,
        claimed: currentCount,
        remaining: 0,
        soldOut: true,
      },
    };
  }

  await db.foundersClaim.upsert({
    where: { offerId_fingerprint: { offerId, fingerprint: params.fingerprint } },
    update: {
      awardedOfferId: offerId,
      competitorPrice: params.competitorPrice,
      zenithPrice: params.zenithPrice,
      savedAmount: params.savedAmount,
      currency: params.currency ?? "USD",
      userId: params.userId,
    },
    create: {
      offerId,
      fingerprint: params.fingerprint,
      awardedOfferId: offerId,
      competitorPrice: params.competitorPrice,
      zenithPrice: params.zenithPrice,
      savedAmount: params.savedAmount,
      currency: params.currency ?? "USD",
      userId: params.userId,
    },
  });

  const updatedCount = currentCount + 1;
  const remaining = Math.max(0, limit - updatedCount);
  return {
    awardedOfferId: offerId,
    replaced: false,
    status: {
      offerId,
      limit,
      claimed: updatedCount,
      remaining,
      soldOut: remaining <= 0,
    },
  };
}
