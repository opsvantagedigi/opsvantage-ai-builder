import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/|_next/|_static/|[\\w-]+\\.\\w+).*)",
  ],
};

export default function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get("host") || "";

  // Define your main domain (localhost for dev, real domain for prod)
  // Ensure this matches your env variable exactly
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "opsvantage.online";

  // Check if we are on a custom subdomain/domain
  const isCustomDomain =
    hostname &&
    !hostname.includes(rootDomain) &&
    !hostname.includes("localhost") &&
    !hostname.includes("vercel.app");

  // EXTRACT SUBDOMAIN (e.g., "nexus" from "nexus.opsvantage.online")
  const searchParams = req.nextUrl.searchParams.toString();
  const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ""}`;

  // 1. HANDLE CUSTOM DOMAINS (e.g. my-bakery.com)
  if (isCustomDomain) {
    return NextResponse.rewrite(
      new URL(`/sites/${hostname}${path}`, req.url)
    );
  }

  // 2. HANDLE SUBDOMAINS (e.g. nexus.opsvantage.online)
  if (hostname.includes(`.${rootDomain}`)) {
    const subdomain = hostname.replace(`.${rootDomain}`, "");
    return NextResponse.rewrite(
      new URL(`/sites/${subdomain}${path}`, req.url)
    );
  }

  // 3. DEFAULT: LANDING PAGE & DASHBOARD
  return NextResponse.next();
}
