import WebSocket from 'ws';

type NeuralMessage =
  | {
      type: 'status';
      request_id?: string;
      stage?: string;
      state?: string;
      message?: string;
      [key: string]: unknown;
    }
  | {
      type: 'error';
      request_id?: string;
      message?: string;
      [key: string]: unknown;
    }
  | {
      type: 'result';
      request_id?: string;
      text?: string;
      audio_b64?: string;
      video_b64?: string;
      audio_format?: string;
      video_format?: string;
      [key: string]: unknown;
    }
  | {
      type: string;
      [key: string]: unknown;
    };

async function main() {
  const wsUrl =
    process.env.NEURAL_CORE_WS_URL ||
    process.env.NEXT_PUBLIC_NEURAL_CORE_WS_URL ||
    'ws://localhost:8080/ws/neural-core';

  const timeoutMs = Number(process.env.WS_TIMEOUT_MS || '180000');
  const origin = process.env.WS_ORIGIN || 'http://localhost:3000';
  const text = (process.env.WS_TEXT || 'Hello MARZ. Please respond briefly with both audio and video.').trim();
  const requestId = process.env.WS_REQUEST_ID || `chat-${Date.now()}`;

  const ws = new WebSocket(wsUrl, { headers: { Origin: origin } });

  const timeout = setTimeout(() => {
    console.error(`[chat] timeout after ${timeoutMs}ms`);
    try {
      ws.close();
    } catch {
      // ignore
    }
    process.exitCode = 1;
  }, timeoutMs);

  function doneOk() {
    clearTimeout(timeout);
    try {
      ws.close();
    } catch {
      // ignore
    }
  }

  function doneErr(message: string) {
    clearTimeout(timeout);
    console.error(message);
    try {
      ws.close();
    } catch {
      // ignore
    }
    process.exitCode = 1;
  }

  ws.on('open', () => {
    console.log(`[chat] connected: ${wsUrl}`);
    ws.send(
      JSON.stringify({
        request_id: requestId,
        text,
        client: 'opsvantage-ai-builder',
        ts: Date.now(),
      }),
    );
  });

  ws.on('message', (data) => {
    const raw = data.toString('utf-8');
    let msg: NeuralMessage;
    try {
      msg = JSON.parse(raw) as NeuralMessage;
    } catch {
      console.log(`[chat] non-json message: ${raw.slice(0, 200)}`);
      return;
    }

    if (msg.type === 'status') {
      const stage = (msg as any).stage || (msg as any).state || '';
      const message = (msg as any).message || '';
      console.log(`[chat] status${stage ? `/${stage}` : ''}${message ? `: ${message}` : ''}`);
      return;
    }

    if (msg.type === 'error') {
      const message = (msg as any).message || 'unknown error';
      doneErr(`[chat] error: ${message}`);
      return;
    }

    if (msg.type === 'result') {
      const result = msg as any;
      const hasAudio = typeof result.audio_b64 === 'string' && result.audio_b64.length > 0;
      const hasVideo = typeof result.video_b64 === 'string' && result.video_b64.length > 0;
      console.log(
        `[chat] result: audio=${hasAudio ? result.audio_b64.length : 0}b64 (${result.audio_format || 'unknown'}), video=${hasVideo ? result.video_b64.length : 0}b64 (${result.video_format || 'unknown'})`,
      );
      console.log(`[chat] text: ${(result.text || '').toString().slice(0, 200)}`);

      if (!hasAudio || !hasVideo) {
        doneErr('[chat] FAIL: expected both audio_b64 and video_b64 in result payload.');
        return;
      }

      doneOk();
      return;
    }

    console.log(`[chat] message: type=${(msg as any).type}`);
  });

  ws.on('close', () => {
    clearTimeout(timeout);
    console.log('[chat] closed');
  });

  ws.on('error', (err) => {
    clearTimeout(timeout);
    console.error('[chat] ws error', err);
    process.exitCode = 1;
  });
}

main().catch((err) => {
  console.error('[chat] fatal', err);
  process.exitCode = 1;
});
