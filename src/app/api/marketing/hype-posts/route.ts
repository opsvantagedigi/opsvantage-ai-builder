import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { applyRateLimit } from '@/lib/rate-limit';
import { getOfferStatus } from '@/lib/claims-counter';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET(req: NextRequest) {
  const rate = await applyRateLimit(req, { keyPrefix: 'api:marketing:hype', limit: 60, windowMs: 60_000 });
  if (!rate.allowed) {
    return NextResponse.json(
      { error: 'Too many requests.' },
      { status: 429, headers: { 'Retry-After': `${rate.retryAfterSeconds}` } },
    );
  }

  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    return NextResponse.json({ error: 'GEMINI_API_KEY is not configured.' }, { status: 501 });
  }

  const { searchParams } = new URL(req.url);
  const countRaw = searchParams.get('count');
  const requestedCount = countRaw ? Number(countRaw) : 3;
  const count = Number.isFinite(requestedCount) ? Math.floor(requestedCount) : 3;
  const safeCount = Math.max(1, Math.min(10, count));

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || '').trim();
  const launchDate = 'March 10, 2026';

  const sovereign = await getOfferStatus('sovereign-25');
  const remaining = sovereign.remaining ?? 0;

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `You are MARZ, an elite enterprise launch operator.
Generate exactly ${safeCount} short hype posts for a viral waitlist launch.
Constraints:
- Each post: <= 260 characters.
- Mention "Sovereign 25" and scarcity (${remaining} spots remaining).
- Mention the launch date (${launchDate}).
- Include a clear CTA to join the waitlist.
- No hashtags.
- Output ONLY valid JSON: {"posts": ["..."]}.
Waitlist URL: ${appUrl || '[APP_URL_NOT_SET]'}
`;

  try {
    const res = await model.generateContent(prompt);
    const text = res.response.text().trim();

    const parsed = JSON.parse(text) as { posts?: unknown };
    const posts = Array.isArray(parsed.posts) ? parsed.posts.filter((p) => typeof p === 'string') : [];

    if (posts.length !== safeCount) {
      return NextResponse.json(
        { error: 'Model returned unexpected output.', raw: text.slice(0, 2000) },
        { status: 502 },
      );
    }

    return NextResponse.json({
      ok: true,
      posts,
      context: {
        offerId: sovereign.offerId,
        remaining,
        launchDate,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Generation failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
