import { NextResponse } from "next/server";
import { openProvider } from "@/lib/openprovider/client";
import { applyRateLimit } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const rate = applyRateLimit(request, { keyPrefix: "api:infrastructure", limit: 40, windowMs: 60_000 });
  if (!rate.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429, headers: { "Retry-After": `${rate.retryAfterSeconds}` } });
  }

  try {
    const { searchParams } = new URL(request.url);
    const service = searchParams.get("service");

    if (service === "ssl") {
      const ssl = await openProvider.getSSLProducts();
      return NextResponse.json({ items: ssl.data.results ?? [] }, { status: 200 });
    }

    if (service === "server") {
      const licenses = await openProvider.listLicenses();
      return NextResponse.json({ items: licenses.data.results ?? [] }, { status: 200 });
    }

    return NextResponse.json({ items: [] }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load service data.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const rate = applyRateLimit(request, { keyPrefix: "api:infrastructure", limit: 30, windowMs: 60_000 });
  if (!rate.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429, headers: { "Retry-After": `${rate.retryAfterSeconds}` } });
  }

  try {
    const body = (await request.json()) as { service?: string; domainOrEmail?: string };

    if (body.service === "security") {
      if (!body.domainOrEmail) {
        return NextResponse.json({ error: "domainOrEmail is required for Security login URL generation." }, { status: 400 });
      }
      const login = await openProvider.generateSpamExpertLoginUrl(body.domainOrEmail, false);
      return NextResponse.json({ url: login.data.url || null }, { status: 200 });
    }

    return NextResponse.json({ error: "Unsupported service action." }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to process request.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
