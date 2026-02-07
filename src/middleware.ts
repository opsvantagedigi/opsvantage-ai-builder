import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const url = request.nextUrl;
    const hostname = request.headers.get('host') || '';

    // Define the main domain
    const mainDomain = 'opsvantagedigital.online';
    const mainDomainWithWww = `www.${mainDomain}`;

    // Path details
    const searchParams = url.searchParams.toString();
    const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ''}`;

    // If it's the main domain (naked or www), serve the root landing page
    if (hostname === mainDomain || hostname === mainDomainWithWww || hostname === 'localhost:3000') {
        // Just proceed normally
        return NextResponse.next();
    }

    // Otherwise, assume it's a subdomain or custom domain pointing to a project
    // Extract subdomain (e.g., 'ajay.opsvantagedigital.online' -> 'ajay')
    let subdomain = hostname.replace(`.${mainDomain}`, '');

    // If it was a www subdomain of the main domain, we already handled it above, 
    // but just in case, let's ensure it's not 'www' or the hostname itself
    if (subdomain === 'www' || subdomain === hostname) {
        // If it's a completely different custom domain, treat the whole domain as the "subdomain" key
        // unless you have a specific mapping logic. 
        // For now, we'll pass the hostname as the subdomain to the dynamic route.
        subdomain = hostname;
    }

    // Rewrite to the subdomain-specific route
    return NextResponse.rewrite(new URL(`/[subdomain]${path}`, request.url).toString().replace('[subdomain]', subdomain));
}

export const config = {
    matcher: [
        /*
         * Match all paths except for:
         * 1. /api routes
         * 2. /_next (Next.js internals)
         * 3. /_static (inside /public)
         * 4. all root files inside /public (e.g. /favicon.ico)
         */
        '/((?!api/|_next/|_static/|[\\w-]+\\.\\w+).*)',
    ],
};
