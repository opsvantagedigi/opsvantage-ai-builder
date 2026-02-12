import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LAUNCH_DATE = new Date("2026-03-10T00:00:00Z");

export async function middleware(req: NextRequest) {
  const now = new Date();
  const { pathname, origin } = req.nextUrl;
  const launchMode = (process.env.NEXT_PUBLIC_LAUNCH_MODE ?? "BETA").toUpperCase();

  const allowPrefixes = ["/api", "/_next"];
  const allowExact = new Set(["/", "/favicon.ico", "/robots.txt", "/sitemap.xml"]);

  if (allowExact.has(pathname) || allowPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  const isPreLaunch = now < LAUNCH_DATE;
  const isReleaseOverride = launchMode === "RELEASE";

  if (isPreLaunch && !isReleaseOverride) {
    return NextResponse.redirect(`${origin}/`);
  }

  const needsAuth = pathname.startsWith("/admin") || pathname.startsWith("/dashboard");
  if (!needsAuth) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "dev-nextauth-secret" });
  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/((?!_next/static|_next/image|favicon.ico|api/webhooks).*)"],
};
