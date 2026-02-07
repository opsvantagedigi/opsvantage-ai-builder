import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const requestHeaders = new Headers(request.headers);
    const requestId = requestHeaders.get('x-request-id') || crypto.randomUUID();
    requestHeaders.set('x-request-id', requestId);

    const response = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });

    response.headers.set('x-request-id', requestId);
    return response;
}

export const config = {
    matcher: '/api/:path*',
};
