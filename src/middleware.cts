// IMPORTANT: This file uses the `.cts` extension to ensure CommonJS output for Next.js middleware.

const { withAuth } = require('next-auth/middleware');
const { NextResponse } = require('next/server');

// `withAuth` is a higher-order function that returns the actual middleware.
// It automatically protects all pages specified in the `matcher` below.
const middleware = withAuth(
  // This function is called ONLY IF the user is authenticated.
  // You can add custom logic here, like role-based access control.
  /**
   * @param {import('next/server').NextRequest} req
   */
  function middleware(req) {
    // Example: Redirect admins from a generic dashboard to the admin panel.
    if (req.nextUrl.pathname.startsWith('/dashboard') && req.nextauth.token?.role === 'admin') {
      return NextResponse.redirect(new URL('/admin', req.url));
    }
  },
  {
    callbacks: {
      // This callback determines if a user is authorized.
      /**
       * @param {{ token: any }} param0
       */
      authorized: ({ token }) => !!token, // `!!token` checks if the user is logged in.
    },
  }
);

// In CommonJS, we export the config as a property on the middleware export.
// Next.js is designed to detect this pattern.
module.exports = middleware;
module.exports.config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
};
