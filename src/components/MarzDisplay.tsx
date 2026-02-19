'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { useNeuralLink } from '@/hooks/useNeuralLink';

type MarzDisplayProps = {
  className?: string;
  wsUrl?: string;
  wakeUrl?: string;
};

type ChatItem = {
  role: 'user' | 'assistant';
  text: string;
  id: string;
};

export default function MarzDisplay({ className, wsUrl, wakeUrl }: MarzDisplayProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [messageText, setMessageText] = useState('');
  const [chat, setChat] = useState<ChatItem[]>([]);
  const [isAwakening, setIsAwakening] = useState(false);
  const [resolvedWsUrl, setResolvedWsUrl] = useState<string | undefined>(wsUrl);
  const hasSentHandshakeRef = useRef(false);

  const { status, stream, lastEvent, lastError, connect, sendMessage, wakeContainer } = useNeuralLink({
    wsUrl: resolvedWsUrl,
    wakeUrl,
    autoConnect: Boolean(resolvedWsUrl),
  });

  useEffect(() => {
    if (wsUrl) {
      setResolvedWsUrl(wsUrl);
      return;
    }

    let cancelled = false;
    const loadRuntimeConfig = async () => {
      try {
        const response = await fetch('/api/config/public', { cache: 'no-store' });
        if (!response.ok) return;
        const payload = (await response.json().catch(() => null)) as { neuralCoreWsUrl?: string } | null;
        const nextUrl = String(payload?.neuralCoreWsUrl || '').trim();
        if (!cancelled && nextUrl) {
          setResolvedWsUrl(nextUrl);
        }
      } catch {
        // ignore
      }
    };

    void loadRuntimeConfig();
    return () => {
      cancelled = true;
    };
  }, [wsUrl]);

  useEffect(() => {
    if (status !== 'connected' || hasSentHandshakeRef.current) {
      return;
    }

    hasSentHandshakeRef.current = true;
    try {
      sendMessage({
        awakening: true,
        request_id: `awakening-${Date.now()}`,
        text: 'Awaken MARZ video presence.',
        client: 'marz-display',
        ts: Date.now(),
      });
    } catch {
      // If the socket isn't ready yet, user can press Reconnect.
      hasSentHandshakeRef.current = false;
    }
  }, [sendMessage, status]);

  useEffect(() => {
    const eventType = String(lastEvent?.type || '').toLowerCase();
    const eventStage = String(lastEvent?.stage || '').toLowerCase();

    if (eventType === 'video_stream' || eventStage === 'awakening' || status === 'waking') {
      setIsAwakening(true);
      return;
    }

    if (eventType === 'result' || status === 'connected') {
      setIsAwakening(false);
    }
  }, [lastEvent, status]);

  useEffect(() => {
    if (!audioRef.current || !stream.audioUrl) {
      return;
    }

    audioRef.current
      .play()
      .catch(() => {
        // Browser autoplay may block until first user interaction.
      });
  }, [stream.audioUrl]);

  useEffect(() => {
    const streamText = typeof stream.text === 'string' ? stream.text.trim() : '';
    if (!streamText) {
      return;
    }

    setChat((prev) => {
      const last = prev[prev.length - 1];
      if (last?.role === 'assistant' && last.text === streamText) {
        return prev;
      }

      return [
        ...prev,
        {
          role: 'assistant',
          text: streamText,
          id: `assistant-${Date.now()}`,
        },
      ];
    });
  }, [stream.text]);

  const handleSend = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = messageText.trim();
    if (!trimmed) {
      return;
    }

    if (status === 'hibernated') {
      void wakeContainer();
      return;
    }

    const nextChat = [
      ...chat,
      {
        role: 'user' as const,
        text: trimmed,
        id: `user-${Date.now()}`,
      },
    ];
    setChat(nextChat);

    const recentHistory = nextChat.slice(-8).map((item) => ({
      role: item.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: item.text }],
    }));

    sendMessage({
      text: trimmed,
      request_id: `chat-${Date.now()}`,
      history: recentHistory,
    });

    setMessageText('');
  };

  return (
    <>
      {isAwakening && <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" />}

      <div className={`${className || ''} ${isAwakening ? 'fixed inset-6 z-50 rounded-2xl border border-cyan-400/40 bg-slate-950/95 p-4 shadow-[0_0_40px_rgba(34,211,238,0.25)]' : ''}`}>
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/40">
        {stream.videoUrl ? (
          <video
            key={stream.videoUrl}
            src={stream.videoUrl}
            className="h-full w-full object-cover"
            autoPlay
            muted
            playsInline
            controls={false}
          />
        ) : (
          <div className="flex min-h-[280px] items-center justify-center bg-slate-950/60 p-6 text-center text-sm text-slate-300">
            {status === 'waking'
              ? 'Waking MARZ neural container...'
              : status === 'hibernated'
                ? 'MARZ neural container is hibernated. Wake request in progress.'
                : 'Awaiting neural stream...'}
          </div>
        )}
      </div>

      <audio ref={audioRef} src={stream.audioUrl} autoPlay hidden />

      <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-300">
        <span className="uppercase tracking-[0.12em]">Neural Link: {status}</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={connect}
            className="rounded border border-cyan-400/40 bg-cyan-500/10 px-2 py-1 text-cyan-200 hover:bg-cyan-500/20"
          >
            Reconnect
          </button>
          <button
            type="button"
            onClick={() => void wakeContainer()}
            className="rounded border border-amber-400/40 bg-amber-500/10 px-2 py-1 text-amber-200 hover:bg-amber-500/20"
          >
            Wake
          </button>
        </div>
      </div>

      <div className="mt-3 max-h-40 overflow-y-auto rounded-lg border border-white/10 bg-slate-950/60 p-2 text-xs">
        {chat.length === 0 ? (
          <p className="text-slate-400">Start a live chat to animate MARZ in real time.</p>
        ) : (
          chat.map((item) => (
            <p key={item.id} className={item.role === 'user' ? 'text-cyan-200' : 'text-emerald-200'}>
              <span className="font-semibold uppercase tracking-[0.08em]">{item.role === 'user' ? 'You' : 'MARZ'}:</span> {item.text}
            </p>
          ))
        )}
      </div>

      <form onSubmit={handleSend} className="mt-2 flex items-center gap-2">
        <input
          id="marz-chat-input"
          name="message"
          type="text"
          value={messageText}
          onChange={(event) => setMessageText(event.target.value)}
          placeholder="Speak to MARZ..."
          className="w-full rounded border border-white/15 bg-slate-900/80 px-2 py-1 text-sm text-slate-100 placeholder:text-slate-500"
        />
        <button
          type="submit"
          className="rounded border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200 hover:bg-emerald-500/20"
        >
          Send
        </button>
      </form>

      {lastError && <p className="mt-2 text-xs text-rose-300">{lastError}</p>}
      </div>
    </>
  );
}
