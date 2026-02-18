import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { applyRateLimit } from '@/lib/rate-limit';

type Platform = 'x' | 'linkedin';

function isPlatform(value: unknown): value is Platform {
  return value === 'x' || value === 'linkedin';
}

export async function POST(req: NextRequest) {
  const rate = await applyRateLimit(req, { keyPrefix: 'api:marketing:blast', limit: 10, windowMs: 60_000 });
  if (!rate.allowed) {
    return NextResponse.json(
      { error: 'Too many requests.' },
      { status: 429, headers: { 'Retry-After': `${rate.retryAfterSeconds}` } },
    );
  }

  const body = (await req.json().catch(() => ({}))) as { platform?: unknown; text?: unknown };
  const platform = body.platform;
  const text = typeof body.text === 'string' ? body.text.trim() : '';

  if (!isPlatform(platform)) {
    return NextResponse.json({ error: 'platform must be "x" or "linkedin".' }, { status: 400 });
  }
  if (!text) {
    return NextResponse.json({ error: 'text is required.' }, { status: 400 });
  }

  // Enterprise scaffold:
  // - We do NOT hard-code API credentials.
  // - If credentials are missing, we return a dry-run payload so ops can validate.

  if (platform === 'x') {
    const bearer = (process.env.X_BEARER_TOKEN || '').trim();
    if (!bearer) {
      return NextResponse.json(
        {
          ok: false,
          dryRun: true,
          platform,
          text,
          error: 'X_BEARER_TOKEN is not configured.',
        },
        { status: 501 },
      );
    }

    // TODO: Implement OAuth 2.0 user-context posting (recommended) or API v2 create tweet.
    // Keeping this as a scaffold until tokens + app permissions are finalized.
    return NextResponse.json({ ok: false, dryRun: true, platform, text, error: 'X posting not implemented yet.' }, { status: 501 });
  }

  if (platform === 'linkedin') {
    const accessToken = (process.env.LINKEDIN_ACCESS_TOKEN || '').trim();
    if (!accessToken) {
      return NextResponse.json(
        {
          ok: false,
          dryRun: true,
          platform,
          text,
          error: 'LINKEDIN_ACCESS_TOKEN is not configured.',
        },
        { status: 501 },
      );
    }

    // TODO: Implement LinkedIn UGC post API once org/user URN is configured.
    return NextResponse.json(
      { ok: false, dryRun: true, platform, text, error: 'LinkedIn posting not implemented yet.' },
      { status: 501 },
    );
  }

  return NextResponse.json({ error: 'Unsupported platform.' }, { status: 400 });
}
