import { NextResponse } from "next/server";
import { openProvider } from "@/lib/openprovider/client";
import { applyRateLimit } from "@/lib/rate-limit";

const MARKUP = parseFloat(process.env.NEXT_PUBLIC_PRICING_MARKUP || "1.5");

function parseDomain(value: string) {
  const parts = value.trim().toLowerCase().split(".");
  if (parts.length < 2) return null;
  const extension = parts.pop();
  const name = parts.join(".");
  if (!extension || !name) return null;
  return { name, extension };
}

export async function POST(request: Request) {
  const rate = applyRateLimit(request, { keyPrefix: "api:domains", limit: 30, windowMs: 60_000 });
  if (!rate.allowed) {
    return NextResponse.json({ error: "Too many requests. Try again shortly." }, { status: 429, headers: { "Retry-After": `${rate.retryAfterSeconds}` } });
  }

  try {
    const body = (await request.json()) as { domain?: string };
    const domain = typeof body.domain === "string" ? body.domain : "";
    const parsed = parseDomain(domain);

    if (!parsed) {
      return NextResponse.json({ error: "Invalid domain format. Use name.tld." }, { status: 400 });
    }

    const response = await openProvider.checkDomain(parsed.name, parsed.extension);
    const result = response.data.results?.[0];

    if (!result) {
      return NextResponse.json({ error: "Domain check returned no result." }, { status: 502 });
    }

    const resellerPrice = result.price?.reseller?.price;
    const currency = result.price?.reseller?.currency || result.price?.product?.currency;

    const payload: Record<string, unknown> = {
      status: result.status,
      domain: result.domain,
      isPremium: Boolean(result.is_premium),
      reason: result.reason,
    };

    if (typeof resellerPrice === "number" && currency) {
      payload.price = {
        currency,
        amount: (resellerPrice * MARKUP).toFixed(2),
      };
    }

    if (result.status === "in use" || result.status === "active" || result.status === "reserved") {
      const tlds = ["com", "net", "org", parsed.extension];
      const suggestions = await openProvider.suggestDomainNames(parsed.name, tlds, 8);
      payload.suggestions = (suggestions.data.results || [])
        .map((item) => {
          if (item.domain) return item.domain;
          if (item.name && item.extension) return `${item.name}.${item.extension}`;
          return null;
        })
        .filter((value): value is string => Boolean(value));
    }

    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Domain lookup failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
