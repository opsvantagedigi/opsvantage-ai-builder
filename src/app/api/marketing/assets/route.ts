import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { applyRateLimit } from '@/lib/rate-limit';

// NOTE: This is a scaffold. Image generation requires an image model/provider.
// When you share the "Social Media Asset Pack", we can host/serve them from /public.

export async function GET(req: NextRequest) {
  const rate = await applyRateLimit(req, { keyPrefix: 'api:marketing:assets', limit: 60, windowMs: 60_000 });
  if (!rate.allowed) {
    return NextResponse.json(
      { error: 'Too many requests.' },
      { status: 429, headers: { 'Retry-After': `${rate.retryAfterSeconds}` } },
    );
  }

  return NextResponse.json(
    {
      ok: false,
      error: 'Image asset generation is not configured yet.',
      next: {
        expected: '10 images (X, LinkedIn, Instagram formats)',
        options: [
          'Upload the Social Media Asset Pack into public/marketing/ and I will wire an index here.',
          'Integrate a provider (e.g., Stability/Replicate/Vertex) and generate on demand.',
        ],
      },
    },
    { status: 501 },
  );
}
