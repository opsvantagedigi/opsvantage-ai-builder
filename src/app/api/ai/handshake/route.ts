import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { applyRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

type HandshakeIntent = 'prewarm' | 'wake';

function toWsUrl(httpUrl: string) {
  const trimmed = httpUrl.trim().replace(/\/$/, '');
  if (!trimmed) return null;

  if (trimmed.startsWith('wss://') || trimmed.startsWith('ws://')) {
    return `${trimmed}/ws/neural-core`;
  }

  if (trimmed.startsWith('https://')) {
    return `wss://${trimmed.slice('https://'.length)}/ws/neural-core`;
  }

  if (trimmed.startsWith('http://')) {
    return `ws://${trimmed.slice('http://'.length)}/ws/neural-core`;
  }

  return null;
}

function toHttpUrl(wsUrl: string): string {
  if (wsUrl.startsWith('wss://')) return wsUrl.replace(/^wss:\/\//, 'https://');
  if (wsUrl.startsWith('ws://')) return wsUrl.replace(/^ws:\/\//, 'http://');
  return wsUrl;
}

async function prewarmHealth(baseUrl: string) {
  const start = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6_000);

  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, '')}/health`, {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal,
    });

    const latencyMs = Date.now() - start;
    const text = await res.text().catch(() => '');
    let json: unknown = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = { raw: text.slice(0, 1000) };
    }

    return { ok: res.ok, status: res.status, latencyMs, payload: json };
  } finally {
    clearTimeout(timeout);
  }
}

async function bestEffortAwakening(wsUrl: string) {
  // Warming the instance via websocket can reduce first-frame latency.
  // This is best-effort: failures should not block the dashboard.
  const { default: WebSocket } = await import('ws');

  return await new Promise<{ ok: boolean; event?: unknown; error?: string }>((resolve) => {
    const timeout = setTimeout(() => {
      try {
        ws.close();
      } catch {
        // ignore
      }
      resolve({ ok: false, error: 'timeout' });
    }, 7_000);

    const ws = new WebSocket(wsUrl, {
      headers: {
        Origin: process.env.NEXT_PUBLIC_APP_URL || 'https://opsvantagedigital.online',
      },
    });

    ws.on('open', () => {
      try {
        ws.send(
          JSON.stringify({
            awakening: true,
            request_id: `handshake-${Date.now()}`,
            text: 'Awaken MARZ video presence.',
          }),
        );
      } catch {
        // ignore
      }
    });

    ws.on('message', (data: any) => {
      const text = typeof data?.toString === 'function' ? data.toString('utf-8') : '';
      try {
        const parsed = text ? JSON.parse(text) : null;
        const type = String(parsed?.type || '').toLowerCase();
        const stage = String(parsed?.stage || '').toLowerCase();
        if (type === 'video_stream' || stage === 'awakening') {
          clearTimeout(timeout);
          try {
            ws.close();
          } catch {
            // ignore
          }
          resolve({ ok: true, event: parsed });
        }
      } catch {
        // ignore
      }
    });

    ws.on('error', (err: any) => {
      clearTimeout(timeout);
      resolve({ ok: false, error: err?.message || 'ws_error' });
    });

    ws.on('close', () => {
      clearTimeout(timeout);
      resolve({ ok: true });
    });
  });
}

export async function POST(req: NextRequest) {
  const rate = await applyRateLimit(req, { keyPrefix: 'api:ai:handshake', limit: 20, windowMs: 60_000 });
  if (!rate.allowed) {
    return NextResponse.json(
      { error: 'Too many requests.' },
      { status: 429, headers: { 'Retry-After': `${rate.retryAfterSeconds}` } },
    );
  }

  const body = (await req.json().catch(() => ({}))) as { intent?: unknown };
  const intent: HandshakeIntent = body.intent === 'wake' ? 'wake' : 'prewarm';

  const baseUrl = String(process.env.NEXT_PUBLIC_NEURAL_CORE_URL || '').trim();
  const explicitWsUrl = String(process.env.NEXT_PUBLIC_NEURAL_CORE_WS_URL || '').trim();
  const wsUrl = explicitWsUrl || (baseUrl ? toWsUrl(baseUrl) : null) || '';

  if (!baseUrl && !wsUrl) {
    return NextResponse.json({ ok: false, error: 'NEXT_PUBLIC_NEURAL_CORE_URL is not set.' }, { status: 500 });
  }

  const resolvedHttpBase = baseUrl || toHttpUrl(wsUrl).replace(/\/ws\/neural-core$/, '');

  let health: Awaited<ReturnType<typeof prewarmHealth>> | null = null;
  try {
    health = await prewarmHealth(resolvedHttpBase);
  } catch {
    health = null;
  }

  let awakening: Awaited<ReturnType<typeof bestEffortAwakening>> | null = null;
  if (intent === 'wake' && wsUrl) {
    try {
      awakening = await bestEffortAwakening(wsUrl);
    } catch {
      awakening = { ok: false, error: 'awakening_failed' };
    }
  }

  return NextResponse.json(
    {
      ok: true,
      neuralCoreUrl: resolvedHttpBase,
      neuralCoreWsUrl: wsUrl,
      intent,
      health,
      awakening,
    },
    { headers: { 'cache-control': 'no-store' } },
  );
}
