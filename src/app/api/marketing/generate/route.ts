import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { applyRateLimit } from '@/lib/rate-limit';
import { getOfferStatus } from '@/lib/claims-counter';

let GoogleGenerativeAI: typeof import('@google/generative-ai').GoogleGenerativeAI | null = null;

type GenerateMode = 'gemini' | 'template';

type CacheEntry = {
  generatedAt: string;
  mode: GenerateMode;
  posts: string[];
  context: {
    launchDate: string;
    waitlistUrl: string;
    sovereign25Remaining: number;
  };
};

function getNztDateKey(date: Date) {
  const parts = new Intl.DateTimeFormat('en-NZ', {
    timeZone: 'Pacific/Auckland',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const year = parts.find((p) => p.type === 'year')?.value ?? '0000';
  const month = parts.find((p) => p.type === 'month')?.value ?? '00';
  const day = parts.find((p) => p.type === 'day')?.value ?? '00';
  return `${year}-${month}-${day}`;
}

function getDailyCacheKey() {
  return `marketing-generate:${getNztDateKey(new Date())}`;
}

function getCache(): Map<string, CacheEntry> {
  const anyGlobal = globalThis as any;
  if (!anyGlobal.__opsvantageMarketingGenerateCache) {
    anyGlobal.__opsvantageMarketingGenerateCache = new Map<string, CacheEntry>();
  }
  return anyGlobal.__opsvantageMarketingGenerateCache as Map<string, CacheEntry>;
}

function templatePosts(params: { remaining: number; waitlistUrl: string; launchDate: string }) {
  const { remaining, waitlistUrl, launchDate } = params;
  const url = waitlistUrl || '[Link]';

  return [
    `Stop building websites. Start building Sovereignty. On ${launchDate} at 10 AM NZT, MARZ awakens. Sovereign 25: ${remaining}/25 spots left. One spin. One legacy. ${url}`,
    `The Founder's Circle is closing: ${remaining}/25 Sovereign 25 spots left. Spin once, lock your advantage, and earn your referral link. Launch: ${launchDate} • 10 AM NZT. ${url}`,
    `Queue Jump. Sovereign 25. Free Domain. THE ZENITH (5 global). Your move. March 10 • 10 AM NZT. Sovereign 25: ${remaining}/25 spots left. ${url}`,
  ];
}

export async function GET(req: NextRequest) {
  const rate = await applyRateLimit(req, { keyPrefix: 'api:marketing:generate', limit: 60, windowMs: 60_000 });
  if (!rate.allowed) {
    return NextResponse.json(
      { error: 'Too many requests.' },
      { status: 429, headers: { 'Retry-After': `${rate.retryAfterSeconds}` } },
    );
  }

  const cacheKey = getDailyCacheKey();
  const cache = getCache();
  const cached = cache.get(cacheKey);
  if (cached) {
    return NextResponse.json({ ok: true, cacheKey, ...cached });
  }

  const launchDate = 'March 10, 2026';
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || '').trim();
  const waitlistUrl = appUrl ? `${appUrl.replace(/\/$/, '')}/` : '';

  const sovereign = await getOfferStatus('sovereign-25');
  const remaining = sovereign.remaining ?? 0;

  const apiKey = (process.env.GEMINI_API_KEY || '').trim();

  let mode: GenerateMode = 'template';
  let posts: string[] = templatePosts({ remaining, waitlistUrl, launchDate });

  if (apiKey) {
    try {
      if (!GoogleGenerativeAI) {
        GoogleGenerativeAI = (await import('@google/generative-ai')).GoogleGenerativeAI;
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `You are MARZ, an elite enterprise launch operator.
Generate exactly 3 high-impact social posts suitable for X or LinkedIn.
Constraints:
- Each post: <= 260 characters.
- Tone: confident, scarcity-driven, premium SaaS.
- Mention: "Sovereign 25" and scarcity (${remaining} spots left).
- Mention: launch date (${launchDate}) and time (10 AM NZT).
- CTA: spin + join waitlist.
- No hashtags.
- Output ONLY valid JSON: {"posts": ["...", "...", "..."]}.
Waitlist URL: ${waitlistUrl || '[Link]'}
`;

      const res = await model.generateContent(prompt);
      const text = res.response.text().trim();
      const parsed = JSON.parse(text) as { posts?: unknown };
      const candidate = Array.isArray(parsed.posts) ? parsed.posts.filter((p) => typeof p === 'string') : [];
      if (candidate.length === 3) {
        mode = 'gemini';
        posts = candidate as string[];
      }
    } catch {
      // keep template fallback
    }
  }

  const entry: CacheEntry = {
    generatedAt: new Date().toISOString(),
    mode,
    posts,
    context: {
      launchDate,
      waitlistUrl,
      sovereign25Remaining: remaining,
    },
  };

  cache.set(cacheKey, entry);

  return NextResponse.json({ ok: true, cacheKey, ...entry });
}
