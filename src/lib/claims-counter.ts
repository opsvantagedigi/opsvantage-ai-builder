import crypto from "crypto";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export type FoundersOfferId =
  | "estate-founder"
  | "wholesale-ghost"
  | "architect-choice"
  | "zenith-discount-15";

export const FOUNDERS_LIMITS: Readonly<Record<FoundersOfferId, number>> = {
  "estate-founder": 50,
  "wholesale-ghost": 25,
  "architect-choice": 25,
  "zenith-discount-15": Number.POSITIVE_INFINITY,
};

export function isFoundersOfferId(value: string | null | undefined): value is FoundersOfferId {
  if (!value) return false;
  return value in FOUNDERS_LIMITS;
}

export function hashFingerprint(input: string | null | undefined) {
  if (!input) return null;
  const salt = process.env.CLAIMS_SALT ?? "dev-claims-salt";
  return crypto.createHash("sha256").update(`${salt}:${input}`).digest("hex");
}

export async function getOfferClaimsCount(offerId: FoundersOfferId) {
  try {
    return await prisma.foundersClaim.count({ where: { offerId } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
      return 0;
    }
    throw error;
  }
}

export async function getOfferStatus(offerId: FoundersOfferId) {
  const limit = FOUNDERS_LIMITS[offerId] ?? 0;
  const claimed = await getOfferClaimsCount(offerId);
  const exhausted = Number.isFinite(limit) ? claimed >= limit : false;
  const remaining = Number.isFinite(limit) ? Math.max(0, limit - claimed) : null;

  return {
    offerId,
    claimed,
    limit: Number.isFinite(limit) ? limit : null,
    remaining,
    exhausted,
  };
}

export async function createOfferClaim(params: {
  offerId: FoundersOfferId;
  fingerprint: string;
  userId?: string | null;
}) {
  const limit = FOUNDERS_LIMITS[params.offerId];

  try {
    await prisma.$transaction(
      async (tx) => {
        const claimed = await tx.foundersClaim.count({ where: { offerId: params.offerId } });
        if (Number.isFinite(limit) && claimed >= limit) {
          throw new Error("Offer is fully claimed.");
        }

        await tx.foundersClaim.create({
          data: {
            offerId: params.offerId,
            fingerprint: params.fingerprint,
            userId: params.userId ?? null,
            awardedOfferId: params.offerId,
          },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new Error("You have already claimed this offer.");
    }
    throw error;
  }

  return getOfferStatus(params.offerId);
}
