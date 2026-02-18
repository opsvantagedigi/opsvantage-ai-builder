import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import WebSocket from 'ws';

import { applyRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

function resolveWsUrl() {
  const explicit = String(process.env.NEXT_PUBLIC_NEURAL_CORE_WS_URL || '').trim();
  if (explicit) return explicit;

  const base = String(process.env.NEXT_PUBLIC_NEURAL_CORE_URL || '').trim();
  if (!base) return '';

  const trimmed = base.replace(/\/$/, '');
  if (trimmed.startsWith('wss://') || trimmed.startsWith('ws://')) {
    return `${trimmed}/ws/neural-core`;
  }

  if (trimmed.startsWith('https://')) {
    return `wss://${trimmed.slice('https://'.length)}/ws/neural-core`;
  }

  if (trimmed.startsWith('http://')) {
    return `ws://${trimmed.slice('http://'.length)}/ws/neural-core`;
  }

  return '';
}

function toHttpUrl(wsUrl: string): string {
  if (wsUrl.startsWith('wss://')) return wsUrl.replace(/^wss:\/\//, 'https://');
  if (wsUrl.startsWith('ws://')) return wsUrl.replace(/^ws:\/\//, 'http://');
  return wsUrl;
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal, cache: 'no-store' });
  } finally {
    clearTimeout(id);
  }
}

async function requestWake(reqUrl: string) {
  const token = String(process.env.NEXT_PUBLIC_GCP_ORCHESTRATOR_WAKE_TOKEN || '').trim();

  // Call our own wake route so it can forward to the upstream orchestrator if configured.
  const url = new URL('/api/orchestrator/wake', reqUrl);
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (token) headers.authorization = `Bearer ${token}`;

  const res = await fetchWithTimeout(
    url.toString(),
    {
      method: 'POST',
      headers,
      body: JSON.stringify({ signal: 'WakeUp', source: 'api/ai/handshake', reason: 'dashboard pre-warm handshake' }),
    },
    8000,
  );

  return res.ok;
}

async function wsAwaken(wsUrl: string, origin: string) {
  return await new Promise<{ ok: boolean; stage: string; message?: string }>((resolve) => {
    const ws = new WebSocket(wsUrl, {
      headers: {
        Origin: origin,
      },
    });

    const timeout = setTimeout(() => {
      try {
        ws.close();
      } catch {
        // ignore
      }
      resolve({ ok: false, stage: 'timeout', message: 'WebSocket handshake timed out.' });
    }, 12_000);

    ws.on('open', () => {
      ws.send(
        JSON.stringify({
          awakening: true,
          text: 'Awaken MARZ video presence.',
          client: 'opsvantage-ai-builder',
          request_id: `handshake-${Date.now()}`,
          ts: Date.now(),
        }),
      );
    });

    ws.on('message', (data) => {
      const text = data.toString('utf-8');
      try {
        const parsed = JSON.parse(text) as { status?: string; message?: string; video_b64?: string; audio_b64?: string };
        const hasStream = Boolean(parsed.video_b64) || Boolean(parsed.audio_b64);
        clearTimeout(timeout);
        try {
          ws.close();
        } catch {
          // ignore
        }
        resolve({ ok: true, stage: hasStream ? 'stream' : 'status', message: parsed.message || parsed.status });
      } catch {
        // non-JSON message, ignore
      }
    });

    ws.on('error', (err) => {
      clearTimeout(timeout);
      try {
        ws.close();
      } catch {
        // ignore
      }
      resolve({ ok: false, stage: 'error', message: err instanceof Error ? err.message : 'WebSocket error.' });
    });

    ws.on('close', () => {
      clearTimeout(timeout);
    });
  });
}

export async function POST(req: NextRequest) {
  const rate = await applyRateLimit(req, { keyPrefix: 'api:ai:handshake', limit: 30, windowMs: 60_000 });
  if (!rate.allowed) {
    return NextResponse.json(
      { ok: false, error: 'Too many requests.' },
      { status: 429, headers: { 'Retry-After': `${rate.retryAfterSeconds}` } },
    );
  }

  const wsUrl = resolveWsUrl();
  if (!wsUrl) {
    return NextResponse.json({ ok: false, error: 'NEXT_PUBLIC_NEURAL_CORE_URL is not configured.' }, { status: 500 });
  }

  const httpWsProbeUrl = toHttpUrl(wsUrl);
  const origin = new URL(req.url).origin;

  let probed404 = false;
  try {
    const probe = await fetchWithTimeout(httpWsProbeUrl, { method: 'GET' }, 4000);
    probed404 = probe.status === 404;
  } catch {
    // ignore
  }

  let woke = false;
  if (probed404) {
    try {
      woke = await requestWake(req.url);
      // brief grace for container to rehydrate
      await new Promise((r) => setTimeout(r, 1200));
    } catch {
      woke = false;
    }
  }

  // Also hit /health to warm CPU path and confirm service is reachable.
  try {
    const base = String(process.env.NEXT_PUBLIC_NEURAL_CORE_URL || '').trim().replace(/\/$/, '');
    if (base.startsWith('http://') || base.startsWith('https://')) {
      await fetchWithTimeout(`${base}/health`, { method: 'GET' }, 5000);
    }
  } catch {
    // ignore
  }

  const wsResult = await wsAwaken(wsUrl, origin);

  return NextResponse.json({
    ok: wsResult.ok,
    wsUrl,
    woke,
    stage: wsResult.stage,
    message: wsResult.message || null,
  });
}

export async function GET(req: NextRequest) {
  // Convenience: allow GET for quick probes.
  return POST(req);
}
