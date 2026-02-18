import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { applyRateLimit } from '@/lib/rate-limit';

// n8n integration scaffold.
// Configure:
// - N8N_MARKETING_WEBHOOK_URL (required)
// - N8N_MARKETING_WEBHOOK_TOKEN (optional bearer token we send to n8n)

export async function POST(req: NextRequest) {
  const rate = await applyRateLimit(req, { keyPrefix: 'api:marketing:schedule', limit: 10, windowMs: 60_000 });
  if (!rate.allowed) {
    return NextResponse.json(
      { error: 'Too many requests.' },
      { status: 429, headers: { 'Retry-After': `${rate.retryAfterSeconds}` } },
    );
  }

  const webhookUrl = (process.env.N8N_MARKETING_WEBHOOK_URL || '').trim();
  if (!webhookUrl) {
    return NextResponse.json({ error: 'N8N_MARKETING_WEBHOOK_URL is not configured.' }, { status: 501 });
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

  const token = (process.env.N8N_MARKETING_WEBHOOK_TOKEN || '').trim();
  const headers: Record<string, string> = {
    'content-type': 'application/json',
  };
  if (token) headers.authorization = `Bearer ${token}`;

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        source: 'opsvantage-ai-builder',
        intent: 'marketing_schedule',
        payload: body,
      }),
    });

    const text = await res.text().catch(() => '');
    if (!res.ok) {
      return NextResponse.json(
        { error: 'n8n schedule webhook failed.', status: res.status, body: text.slice(0, 2000) },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, forwarded: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
