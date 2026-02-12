import { withAuth } from 'next-auth/middleware';
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Configuration for NextAuth middleware
export default withAuth(
  // The middleware function that runs when auth is successful
  function middleware(req: NextRequest) {
    const now = new Date();
    const { pathname, origin } = req.nextUrl;
    const launchMode = (process.env.NEXT_PUBLIC_LAUNCH_MODE ?? "BETA").toUpperCase();

    // Allow access to admin routes only for authenticated users
    if (pathname.startsWith('/admin')) {
      // The withAuth wrapper already handles authentication
      return NextResponse.next();
    }

    // Handle pre-launch restrictions for non-admin routes
    const LAUNCH_DATE = new Date("2026-03-10T00:00:00Z");
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

    return NextResponse.next();
  },
  {
    // Custom configuration for the auth middleware
    pages: {
      signIn: '/login', // Make sure this matches your authOptions pages.signIn
    },
    // Specify which routes should be protected
    callbacks: {
      authorized: ({ token }) => {
        // For admin routes, require valid token
        // For other routes, allow if not in pre-launch mode
        return !!token; // Only allow access if there's a valid token
      }
    }
  }
);

// Define which paths the middleware should run on
export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    // - public folder files
    '/admin/:path*',
    '/dashboard/:path*',
    '/((?!_next/static|_next/image|favicon.ico|api/webhooks).*)',
  ],
};
