import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as { password?: unknown };
    const inputPassword = String(body.password ?? '');

    if (inputPassword === process.env.SOVEREIGN_PASSWORD) {
      const response = NextResponse.json({ ok: true, granted: true });
      response.cookies.set('zenith_admin_token', 'sovereign', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 12,
      });
      return response;
    }

    return NextResponse.json({ ok: false, error: 'Invalid Gateway Access' }, { status: 401 });
  } catch (error) {
    const details = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { ok: false, error: 'Login route failed', details },
      { status: 500 }
    );
  }
}
