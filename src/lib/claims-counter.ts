import crypto from "crypto";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export type FoundersOfferId =
  | "estate-founder"
  | "wholesale-ghost"
  | "architect-choice"
  | "sovereign-25"
  | "wheel-zenith"
  | "zenith-discount-15";

export const FOUNDERS_LIMITS: Readonly<Record<FoundersOfferId, number>> = {
  "estate-founder": 50,
  "wholesale-ghost": 25,
  "architect-choice": 25,
  "sovereign-25": 25,
  "wheel-zenith": 5,
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
  let claim: { id: string; sequence: number | null } | null = null;
  const maxRetries = 3;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      claim = await prisma.$transaction(
        async (tx) => {
          const claimed = await tx.foundersClaim.count({ where: { offerId: params.offerId } });
          if (Number.isFinite(limit) && claimed >= limit) {
            throw new Error("Offer is fully claimed.");
          }

          const nextSequence = claimed + 1;
          return await tx.foundersClaim.create({
            data: {
              offerId: params.offerId,
              fingerprint: params.fingerprint,
              userId: params.userId ?? null,
              awardedOfferId: params.offerId,
              sequence: nextSequence,
            },
            select: { id: true, sequence: true },
          });
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
      );
      break;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          const target = (error.meta as { target?: string[] } | undefined)?.target;
          if (Array.isArray(target) && target.includes("fingerprint")) {
            throw new Error("You have already claimed this offer.");
          }
          // Sequence collision: retry.
        } else if (error.code === "P2034") {
          // Transaction conflict: retry.
        }
      } else if (error instanceof Error && error.message === "Offer is fully claimed.") {
        throw error;
      } else if (error instanceof Error && error.message === "You have already claimed this offer.") {
        throw error;
      }

      if (attempt === maxRetries - 1) {
        throw error;
      }
    }
  }

  const status = await getOfferStatus(params.offerId);
  return {
    ...status,
    claimId: claim?.id ?? null,
    claimSequence: claim?.sequence ?? null,
  };
}
