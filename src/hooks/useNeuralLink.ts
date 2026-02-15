import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type NeuralLinkStatus = 'idle' | 'connecting' | 'connected' | 'error' | 'hibernated' | 'waking';

type NeuralLinkEvent = {
  type?: string;
  stage?: string;
  state?: string;
  message?: string;
  request_id?: string;
  requestId?: string;
  text?: string;
  audio_b64?: string;
  video_b64?: string;
  audio_format?: string;
  video_format?: string;
};

type StreamPayload = {
  requestId?: string;
  text?: string;
  audioUrl?: string;
  videoUrl?: string;
};

type UseNeuralLinkOptions = {
  wsUrl?: string;
  wakeUrl?: string;
  wakeToken?: string;
  autoConnect?: boolean;
  reconnectDelayMs?: number;
  onMessage?: (event: NeuralLinkEvent) => void;
};

type ChatHistoryItem = {
  role?: string;
  parts?: Array<{ text?: string }>;
};

const WAKE_COOLDOWN_MS = 60_000;

function resolveDefaultWsUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_NEURAL_CORE_WS_URL?.trim();
  if (explicit) {
    return explicit;
  }

  const base = process.env.NEXT_PUBLIC_NEURAL_CORE_URL?.trim();
  if (base) {
    if (base.startsWith('ws://') || base.startsWith('wss://')) {
      return `${base.replace(/\/$/, '')}/ws/neural-core`;
    }

    if (base.startsWith('http://') || base.startsWith('https://')) {
      const wsProtocol = base.startsWith('https://') ? 'wss://' : 'ws://';
      return `${base.replace(/^https?:\/\//, wsProtocol).replace(/\/$/, '')}/ws/neural-core`;
    }
  }

  return 'ws://localhost:8080/ws/neural-core';
}

function toHttpUrl(wsUrl: string): string {
  if (wsUrl.startsWith('wss://')) {
    return wsUrl.replace(/^wss:\/\//, 'https://');
  }
  if (wsUrl.startsWith('ws://')) {
    return wsUrl.replace(/^ws:\/\//, 'http://');
  }
  return wsUrl;
}

function decodeBase64ToBlobUrl(encoded: string, mimeType: string): string {
  const binary = atob(encoded);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let index = 0; index < len; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  const blob = new Blob([bytes], { type: mimeType });
  return URL.createObjectURL(blob);
}

function normalizeHistoryForSdk(history: unknown): unknown {
  if (!Array.isArray(history)) {
    return history;
  }

  const sanitized = [...(history as ChatHistoryItem[])];
  const first = sanitized[0];

  if (first?.role === 'model') {
    sanitized.unshift({
      role: 'user',
      parts: [{ text: 'system-init' }],
    });
  }

  return sanitized;
}

export function useNeuralLink({
  wsUrl,
  wakeUrl,
  wakeToken,
  autoConnect = true,
  reconnectDelayMs = 4_000,
  onMessage,
}: UseNeuralLinkOptions = {}) {
  const websocketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const connectRef = useRef<(() => void) | null>(null);
  const wakeInFlightRef = useRef(false);
  const lastWakeAtRef = useRef(0);
  const audioUrlRef = useRef<string | undefined>(undefined);
  const videoUrlRef = useRef<string | undefined>(undefined);

  const [status, setStatus] = useState<NeuralLinkStatus>('idle');
  const [lastError, setLastError] = useState<string | null>(null);
  const [stream, setStream] = useState<StreamPayload>({});
  const [lastEvent, setLastEvent] = useState<NeuralLinkEvent | null>(null);
  const statusRef = useRef<NeuralLinkStatus>('idle');

  const effectiveWsUrl = wsUrl || resolveDefaultWsUrl();
  const effectiveWakeUrl = wakeUrl || process.env.NEXT_PUBLIC_GCP_ORCHESTRATOR_WAKE_URL || '';
  const effectiveWakeToken = wakeToken || process.env.NEXT_PUBLIC_GCP_ORCHESTRATOR_WAKE_TOKEN || '';

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const clearMediaUrls = useCallback(() => {
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = undefined;
    }
    if (videoUrlRef.current) {
      URL.revokeObjectURL(videoUrlRef.current);
      videoUrlRef.current = undefined;
    }
  }, []);

  const wakeContainer = useCallback(async () => {
    const now = Date.now();
    if (wakeInFlightRef.current || now - lastWakeAtRef.current < WAKE_COOLDOWN_MS) {
      return;
    }

    if (!effectiveWakeUrl) {
      setStatus('hibernated');
      setLastError('Neural core appears hibernated and no wake URL is configured.');
      return;
    }

    wakeInFlightRef.current = true;
    setStatus('waking');

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (effectiveWakeToken) {
        headers.Authorization = `Bearer ${effectiveWakeToken}`;
      }

      const response = await fetch(effectiveWakeUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          signal: 'WakeUp',
          source: 'marz-display',
          reason: 'WebSocket endpoint returned 404/container hibernated',
        }),
      });

      if (!response.ok) {
        throw new Error(`Wake request failed: ${response.status}`);
      }

      lastWakeAtRef.current = Date.now();
      setLastError(null);
      setTimeout(() => {
        setStatus('idle');
      }, 1200);
    } catch (error) {
      setStatus('error');
      setLastError(error instanceof Error ? error.message : 'Wake request failed.');
    } finally {
      wakeInFlightRef.current = false;
    }
  }, [effectiveWakeToken, effectiveWakeUrl]);

  const verify404AndWake = useCallback(async () => {
    try {
      const probeUrl = toHttpUrl(effectiveWsUrl);
      const response = await fetch(probeUrl, { method: 'GET', cache: 'no-store' });
      if (response.status === 404) {
        await wakeContainer();
      }
    } catch {
      // Ignore probe errors; websocket close reason handling still applies.
    }
  }, [effectiveWsUrl, wakeContainer]);

  const disconnect = useCallback(() => {
    if (reconnectTimerRef.current) {
      window.clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    if (websocketRef.current) {
      websocketRef.current.close();
      websocketRef.current = null;
    }

    setStatus('idle');
  }, []);

  const connect = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
      return;
    }

    setStatus('connecting');
    setLastError(null);

    const socket = new WebSocket(effectiveWsUrl);
    websocketRef.current = socket;

    socket.onopen = () => {
      setStatus('connected');
      setLastError(null);
    };

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(String(event.data)) as NeuralLinkEvent;
        setLastEvent(payload);
        onMessage?.(payload);

        if (payload.type === 'error') {
          setLastError(payload.message || 'Neural core returned an error.');
          return;
        }

        if (payload.type === 'result') {
          const nextStream: StreamPayload = {
            requestId: payload.request_id || payload.requestId,
            text: payload.text,
          };

          if (payload.audio_b64) {
            if (audioUrlRef.current) {
              URL.revokeObjectURL(audioUrlRef.current);
            }
            const mimeType = payload.audio_format === 'wav' ? 'audio/wav' : 'audio/mpeg';
            audioUrlRef.current = decodeBase64ToBlobUrl(payload.audio_b64, mimeType);
            nextStream.audioUrl = audioUrlRef.current;
          }

          if (payload.video_b64) {
            if (videoUrlRef.current) {
              URL.revokeObjectURL(videoUrlRef.current);
            }
            const mimeType = payload.video_format === 'webm' ? 'video/webm' : 'video/mp4';
            videoUrlRef.current = decodeBase64ToBlobUrl(payload.video_b64, mimeType);
            nextStream.videoUrl = videoUrlRef.current;
          }

          setStream(nextStream);
        }
      } catch (error) {
        setLastError(error instanceof Error ? error.message : 'Invalid message payload');
      }
    };

    socket.onerror = () => {
      setStatus('error');
      setLastError('Neural core connection error.');
    };

    socket.onclose = async (event) => {
      websocketRef.current = null;
      const currentStatus = statusRef.current;

      const closeReason = String(event.reason || '');
      const is404 = event.code === 404 || /404/i.test(closeReason);

      if (is404) {
        setStatus('hibernated');
        setLastError('Neural core container is hibernated (404). Requesting wake-up...');
        await wakeContainer();
      } else if (event.code === 1006 && currentStatus === 'connecting') {
        await verify404AndWake();
      } else if (currentStatus !== 'idle') {
        setStatus('error');
      }

      if (autoConnect && currentStatus !== 'idle') {
        reconnectTimerRef.current = window.setTimeout(() => {
          connectRef.current?.();
        }, reconnectDelayMs);
      }
    };
  }, [autoConnect, effectiveWsUrl, onMessage, reconnectDelayMs, verify404AndWake, wakeContainer]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  const send = useCallback((payload: Record<string, unknown>) => {
    if (!websocketRef.current || websocketRef.current.readyState !== WebSocket.OPEN) {
      throw new Error('Neural link is not connected');
    }

    const normalizedPayload = {
      ...payload,
      history: normalizeHistoryForSdk(payload.history),
    };

    websocketRef.current.send(JSON.stringify(normalizedPayload));
  }, []);

  const sendMessage = useCallback((payload: Record<string, unknown>) => {
    send(payload);
  }, [send]);

  useEffect(() => {
    if (!autoConnect) {
      return () => {
        clearMediaUrls();
        disconnect();
      };
    }

    connect();

    return () => {
      clearMediaUrls();
      disconnect();
    };
  }, [autoConnect, clearMediaUrls, connect, disconnect]);

  return useMemo(
    () => ({
      status,
      stream,
      lastEvent,
      lastError,
      connect,
      disconnect,
      send,
      sendMessage,
      wakeContainer,
    }),
    [status, stream, lastEvent, lastError, connect, disconnect, send, sendMessage, wakeContainer]
  );
}
