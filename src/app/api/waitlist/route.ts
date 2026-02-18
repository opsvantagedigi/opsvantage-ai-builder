import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { applyRateLimit } from "@/lib/rate-limit";

import { createOfferClaim } from "@/lib/claims-counter";

async function syncLeadToResendAudience(email: string) {
  const apiKey = (process.env.RESEND_API_KEY || "").trim();
  const audienceId = (process.env.RESEND_AUDIENCE_ID || "").trim();
  if (!apiKey || !audienceId) return;

  // Best-effort only. This is the "instant sync" needed for warm-up automation.
  // If you don't want Resend audiences, leave RESEND_AUDIENCE_ID unset.
  try {
    await fetch(`https://api.resend.com/audiences/${encodeURIComponent(audienceId)}/contacts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });
  } catch {
    // ignore
  }
}

function isValidEmail(email: unknown): email is string {
  if (typeof email !== "string") return false;
  const trimmed = email.trim();
  if (!trimmed) return false;
  return /.+@.+\..+/.test(trimmed);
}

function randomReferralCode() {
  // URL-safe, short, case-insensitive.
  return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6);
}

async function createLeadWithUniqueReferralCode(
  tx: typeof prisma,
  params: { email: string; source?: string; referredById?: string | null; wheelPrize: WheelPrize }
) {
  // Extremely low probability of collision, but handle it deterministically.
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      return await tx.launchLead.create({
        data: {
          email: params.email,
          source: params.source,
          referralCode: randomReferralCode(),
          referredById: params.referredById ?? null,
          wheelPrize: params.wheelPrize,
          wheelPrizeAt: new Date(),
        },
        select: {
          id: true,
          email: true,
          referralCode: true,
          referredById: true,
          referralsCount: true,
          wheelPrize: true,
          wheelPrizeAt: true,
          sovereignFounder: true,
          createdAt: true,
        },
      });
    } catch (err: unknown) {
      const anyErr = err as { code?: string };
      // P2002 = unique constraint
      if (anyErr?.code === "P2002") continue;
      throw err;
    }
  }
  throw new Error("Unable to allocate referral code. Please retry.");
}

const WHEEL_PRIZES = [
  "queue_jump",
  "sovereign_25_discount_code",
  "free_custom_domain",
  "zenith_lifetime_pro",
] as const;

type WheelPrize = (typeof WHEEL_PRIZES)[number];

function isWheelPrize(value: unknown): value is WheelPrize {
  return typeof value === "string" && (WHEEL_PRIZES as readonly string[]).includes(value);
}

function pickPrize(): WheelPrize {
  // Probability Weighted:
  // 50% Queue Jump (+100 spots)
  // 25% Sovereign 25 Discount Code
  // 15% Free Custom Domain (1 year)
  // 10% THE ZENITH (enforced server-side with offer cap)
  const r = Math.random();
  if (r < 0.5) return "queue_jump";
  if (r < 0.75) return "sovereign_25_discount_code";
  if (r < 0.9) return "free_custom_domain";
  return "zenith_lifetime_pro";
}

async function computePosition(leadId: string) {
  const lead = await prisma.launchLead.findUnique({
    where: { id: leadId },
    select: { id: true, createdAt: true, referralsCount: true, wheelPrize: true },
  });
  if (!lead) return null;

  const base =
    (await prisma.launchLead.count({
      where: { createdAt: { lt: lead.createdAt } },
    })) + 1;

  const referralsCount = lead.referralsCount ?? 0;
  const referralBoost = referralsCount * 10;
  const prizeBoost = lead.wheelPrize === "queue_jump" ? 100 : 0;

  const boost = referralBoost + prizeBoost;
  let estimated = Math.max(1, base - boost);

  // Referral milestones:
  // - 3 referrals => Move to Top 50 of the waitlist.
  if (referralsCount >= 3) {
    estimated = Math.min(estimated, 50);
  }

  return { base, boost, estimated };
}

export async function GET(request: Request) {
  const rate = await applyRateLimit(request, { keyPrefix: "api:waitlist:get", limit: 60, windowMs: 60_000 });
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many requests." },
      { status: 429, headers: { "Retry-After": `${rate.retryAfterSeconds}` } }
    );
  }

  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  const code = searchParams.get("code");

  if (!email && !code) {
    return NextResponse.json({ error: "email or code is required." }, { status: 400 });
  }

  const where = email
    ? { email: email.trim().toLowerCase() }
    : { referralCode: String(code).trim() };

  const lead = await prisma.launchLead.findUnique({
    where: where as any,
    select: {
      id: true,
      email: true,
      referralCode: true,
      referralsCount: true,
      wheelPrize: true,
      wheelPrizeAt: true,
      sovereignFounder: true,
      createdAt: true,
    },
  });

  if (!lead) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const position = await computePosition(lead.id);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  const referralUrl = appUrl ? `${appUrl.replace(/\/$/, "")}/?ref=${encodeURIComponent(lead.referralCode)}` : null;

  return NextResponse.json({
    lead: {
      email: lead.email,
      referralCode: lead.referralCode,
      referralUrl,
      referralsCount: lead.referralsCount,
      wheelPrize: lead.wheelPrize,
      sovereignFounder: lead.sovereignFounder,
      createdAt: lead.createdAt,
    },
    position,
  });
}

export async function POST(request: Request) {
  const rate = await applyRateLimit(request, { keyPrefix: "api:waitlist", limit: 15, windowMs: 60_000 });
  if (!rate.allowed) {
    return NextResponse.json({ error: "Too many requests. Please try again in a minute." }, { status: 429, headers: { "Retry-After": `${rate.retryAfterSeconds}` } });
  }

  try {
    const body = (await request.json()) as { email?: unknown; source?: unknown; referralCode?: unknown; wheelPrize?: unknown };
    const email = body.email;
    const sourceRaw = typeof body.source === "string" ? body.source.trim().slice(0, 120) : undefined;
    const source = sourceRaw ? sourceRaw.toLowerCase() : undefined;
    const referralCode = typeof body.referralCode === "string" ? body.referralCode.trim().slice(0, 32) : undefined;
    const requestedPrize = isWheelPrize(body.wheelPrize) ? (body.wheelPrize as WheelPrize) : null;

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const { lead, didCreate } = await prisma.$transaction(async (tx) => {
      // If lead already exists, keep referral/prize/founder state stable.
      const existing = await tx.launchLead.findUnique({
        where: { email: normalizedEmail },
        select: { id: true, referralCode: true, wheelPrize: true, sovereignFounder: true },
      });

      let referrerId: string | null = null;
      if (!existing && referralCode) {
        const referrer = await tx.launchLead.findUnique({
          where: { referralCode },
          select: { id: true, email: true },
        });
        if (referrer && referrer.email !== normalizedEmail) {
          referrerId = referrer.id;
        }
      }

      const created = existing
        ? await tx.launchLead.update({
            where: { email: normalizedEmail },
            data: { notified: false, source },
            select: {
              id: true,
              email: true,
              referralCode: true,
              referredById: true,
              referralsCount: true,
              wheelPrize: true,
              wheelPrizeAt: true,
              sovereignFounder: true,
              createdAt: true,
            },
          })
        : await createLeadWithUniqueReferralCode(tx as any, {
            email: normalizedEmail,
            source,
            referredById: referrerId,
            wheelPrize: requestedPrize ?? pickPrize(),
          });

      if (!existing && referrerId) {
        const isViralShare = Boolean(source && source.startsWith("share-"));
        await tx.launchLead.update({
          where: { id: referrerId },
          data: { referralsCount: { increment: isViralShare ? 2 : 1 } },
        });
      }

      return { lead: created, didCreate: !existing };
    });

    // Sovereign-25 sequences are reserved for paid/converted founders.
    // Waitlist should NOT consume real `sovereign-25` slots.
    const sovereignFounder = Boolean(lead.sovereignFounder);

    // Instant lead sync (best-effort)
    if (didCreate) {
      await syncLeadToResendAudience(lead.email);
    }

    // If an existing lead has no wheelPrize yet, allow a single set.
    let finalPrize = (lead.wheelPrize as WheelPrize | null) ?? null;
    if (!finalPrize && requestedPrize) {
      finalPrize = requestedPrize;
      await prisma.launchLead.update({
        where: { id: lead.id },
        data: { wheelPrize: finalPrize, wheelPrizeAt: new Date() },
      });
    }

    // Enforce Zenith cap (5 total) using FoundersClaim offer limit.
    if (finalPrize === "zenith_lifetime_pro") {
      try {
        await createOfferClaim({
          offerId: "wheel-zenith",
          fingerprint: `lead:${lead.id}`,
          userId: null,
        });
      } catch {
        finalPrize = "queue_jump";
        await prisma.launchLead.update({
          where: { id: lead.id },
          data: { wheelPrize: finalPrize, wheelPrizeAt: new Date() },
        });
      }
    }

    // Referral milestone UI is handled client-side; do not claim sovereign-25 here.

    const position = await computePosition(lead.id);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
    const referralUrl = appUrl ? `${appUrl.replace(/\/$/, "")}/?ref=${encodeURIComponent(lead.referralCode)}` : null;

    return NextResponse.json(
      {
        message: "You are on the OpsVantage launch waitlist.",
        lead: {
          email: lead.email,
          referralCode: lead.referralCode,
          referralUrl,
          referralsCount: lead.referralsCount,
          wheelPrize: finalPrize,
          sovereignFounder,
        },
        position,
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
