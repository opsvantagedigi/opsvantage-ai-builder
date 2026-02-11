import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define the middleware using withAuth as the base
export default withAuth(
  // Custom middleware function
  async function middleware(req: NextRequest) {
    const url = req.nextUrl;
    const hostname = req.headers.get("host");
    const path = url.pathname;

    // 1. MARZ OVERRIDE: Map your domain to the /home folder
    if (hostname === "opsvantagedigital.online" || hostname === "www.opsvantagedigital.online") {
      // If it's an admin/dashboard path, run the auth middleware
      if (path.startsWith('/admin') || path.startsWith('/dashboard')) {
        return NextResponse.next(); // Allow withAuth to handle auth
      }
      // Otherwise, show the Home/Coming Soon content
      return NextResponse.rewrite(new URL(`/home${path === "/" ? "" : path}`, req.url));
    }

    // 2. Default Auth protection for other domains/paths
    // For non-MARZ domains, just continue with normal flow
    return NextResponse.next();
  },
  {
    // Optionally, you can configure pages to skip auth
    pages: {
      signIn: '/auth/signin',
    }
  }
);

export const config = {
  matcher: ["/((?!api/|_next/|_static|[\\w-]+\\.\\w+).*)"],
};