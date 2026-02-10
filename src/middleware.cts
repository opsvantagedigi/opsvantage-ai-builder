import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get("host");
  const path = url.pathname;

  // 1. MARZ OVERRIDE: Map your domain to the /home folder
  if (hostname === "opsvantagedigital.online" || hostname === "www.opsvantagedigital.online") {
    // If it's an admin/dashboard path, run the auth middleware
    if (path.startsWith('/admin') || path.startsWith('/dashboard')) {
      return withAuth(req);
    }
    // Otherwise, show the Home/Coming Soon content
    return NextResponse.rewrite(new URL(`/home${path === "/" ? "" : path}`, req.url));
  }

  // 2. Default Auth protection for other domains/paths
  if (path.startsWith('/admin') || path.startsWith('/dashboard')) {
    return withAuth(req);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)"],
};

export default middleware;