import WebSocket from 'ws';

type HandshakeResponse = {
  status?: string;
  message?: string;
  video_b64?: string;
  audio_b64?: string;
  [key: string]: unknown;
};

async function main() {
  const wsUrl =
    process.env.NEURAL_CORE_WS_URL ||
    process.env.NEXT_PUBLIC_NEURAL_CORE_WS_URL ||
    'ws://localhost:8080/ws/neural-core';

  const timeoutMs = Number(process.env.WS_TIMEOUT_MS || '20000');

  const ws = new WebSocket(wsUrl, {
    headers: {
      // Optional; some deployments enforce origin checks
      Origin: process.env.WS_ORIGIN || 'http://localhost:3000',
    },
  });

  const timeout = setTimeout(() => {
    console.error(`[handshake] timeout after ${timeoutMs}ms`);
    ws.close();
    process.exitCode = 1;
  }, timeoutMs);

  ws.on('open', () => {
    console.log(`[handshake] connected: ${wsUrl}`);
    const text = (process.env.WS_TEXT || 'Awaken MARZ').trim();
    ws.send(
      JSON.stringify({
        awakening: true,
        text,
        // Allow the server to decide defaults; keep payload minimal.
        client: 'opsvantage-ai-builder',
        ts: Date.now(),
      }),
    );
  });

  ws.on('message', (data) => {
    const text = data.toString('utf-8');
    let parsed: HandshakeResponse | null = null;
    try {
      parsed = JSON.parse(text) as HandshakeResponse;
    } catch {
      // Not JSON; still print for debugging.
      console.log(`[handshake] message: ${text.slice(0, 500)}`);
      return;
    }

    if (parsed.status || parsed.message) {
      console.log(`[handshake] status: ${parsed.status || ''} ${parsed.message || ''}`.trim());
    }

    const hasVideo = typeof parsed.video_b64 === 'string' && parsed.video_b64.length > 0;
    const hasAudio = typeof parsed.audio_b64 === 'string' && parsed.audio_b64.length > 0;

    if (hasVideo || hasAudio) {
      console.log(
        `[handshake] received stream payload: video=${hasVideo ? parsed.video_b64!.length : 0}b64, audio=${hasAudio ? parsed.audio_b64!.length : 0}b64`,
      );
      clearTimeout(timeout);
      ws.close();
    }
  });

  ws.on('close', () => {
    clearTimeout(timeout);
    console.log('[handshake] closed');
  });

  ws.on('error', (err) => {
    clearTimeout(timeout);
    console.error('[handshake] error', err);
    process.exitCode = 1;
  });
}

main().catch((err) => {
  console.error('[handshake] fatal', err);
  process.exitCode = 1;
});
