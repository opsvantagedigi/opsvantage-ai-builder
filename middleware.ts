import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const LAUNCH_DATE = new Date('2026-03-13T00:00:00Z');
const IS_COMING_SOON = new Date() < LAUNCH_DATE;

// Routes that should always be accessible
const PUBLIC_ROUTES = ['/coming-soon', '/api', '/auth'];

// Routes that require launch to be active
const PROTECTED_ROUTES = ['/dashboard', '/studio', '/builder', '/sites'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow all public routes
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // If coming soon is active and user tries to access protected routes
  if (IS_COMING_SOON && PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
    const token = await getToken({ req: request });

    // Allow authenticated admins to access (for testing)
    if (token && (token as any).role === 'ADMIN') {
      return NextResponse.next();
    }

    // Redirect to coming soon page
    return NextResponse.redirect(new URL('/coming-soon', request.url));
  }

  // If launch date has passed and user is on coming soon, redirect to home
  if (!IS_COMING_SOON && pathname === '/coming-soon') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
