import { NextResponse } from "next/server";
import { openProvider } from "@/lib/openprovider/client";
import { applyRateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

export async function GET(request: Request) {
  const rate = await applyRateLimit(request, { keyPrefix: "api:infrastructure", limit: 40, windowMs: 60_000 });
  if (!rate.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429, headers: { "Retry-After": `${rate.retryAfterSeconds}` } });
  }

  try {
    const { searchParams } = new URL(request.url);
    const service = searchParams.get("service");

    if (service === "ssl") {
      const ssl = await openProvider.getSSLProducts();
      // Format SSL products with pricing info for the UI
      const formattedItems = (ssl.data.results ?? []).map((item: any) => ({
        ...item,
        price: item.price?.reseller?.price || item.price?.price || 0,
        category: "SSL Certificate",
        description: item.description || "SSL certificate for secure connections"
      }));
      return NextResponse.json({ items: formattedItems }, { status: 200 });
    }

    if (service === "server") {
      const catalog = await openProvider.getLicenseItems();
      // Format license items with pricing info for the UI
      const formattedItems = (catalog.data.results ?? []).map((item: any) => ({
        ...item,
        price: item.price?.reseller?.price || item.price?.price || 0,
        category: "Server License",
        description: item.description || "Server license for hosting"
      }));
      return NextResponse.json({ items: formattedItems }, { status: 200 });
    }

    // For domains, we'll return sample data since domain pricing is typically checked individually
    if (service === "domains") {
      return NextResponse.json({ 
        items: [
          { name: "Standard Domain (.com)", price: 12.99, category: "Domain Registration", description: "Standard .com domain registration" },
          { name: "Premium Domain (.io)", price: 29.99, category: "Domain Registration", description: "Premium .io domain for tech companies" },
          { name: "Business Domain (.biz)", price: 14.99, category: "Domain Registration", description: "Business-focused domain extension" },
          { name: "Global Domain (.global)", price: 19.99, category: "Domain Registration", description: "Global presence domain extension" }
        ]
      }, { status: 200 });
    }

    // For security services
    if (service === "security") {
      return NextResponse.json({ 
        items: [
          { name: "SpamExpert Email Security", price: 49.99, category: "Email Security", description: "Advanced spam and malware filtering" },
          { name: "DDoS Protection Basic", price: 79.99, category: "Network Security", description: "Basic DDoS protection for websites" },
          { name: "Web Application Firewall", price: 129.99, category: "Application Security", description: "Protects against web-based attacks" },
          { name: "Enterprise Security Suite", price: 199.99, category: "Comprehensive Security", description: "Complete security solution" }
        ]
      }, { status: 200 });
    }

    return NextResponse.json({ items: [] }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load service data.";
    logger.error("Error fetching service data", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const rate = await applyRateLimit(request, { keyPrefix: "api:infrastructure", limit: 30, windowMs: 60_000 });
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
    logger.error("Error processing POST request", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
