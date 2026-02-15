'use client';

import { useEffect, useRef } from 'react';
import { useNeuralLink } from '@/hooks/useNeuralLink';

type MarzDisplayProps = {
  className?: string;
  wsUrl?: string;
  wakeUrl?: string;
};

export default function MarzDisplay({ className, wsUrl, wakeUrl }: MarzDisplayProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { status, stream, lastError, connect, send, wakeContainer } = useNeuralLink({
    wsUrl,
    wakeUrl,
    autoConnect: true,
  });

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

  const handlePing = () => {
    send({
      text: 'Neural link heartbeat ping from dashboard.',
      request_id: `ping-${Date.now()}`,
    });
  };

  return (
    <div className={className}>
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
            onClick={handlePing}
            className="rounded border border-emerald-400/40 bg-emerald-500/10 px-2 py-1 text-emerald-200 hover:bg-emerald-500/20"
          >
            Ping
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

      {stream.text && <p className="mt-2 text-sm text-slate-200">{stream.text}</p>}
      {lastError && <p className="mt-2 text-xs text-rose-300">{lastError}</p>}
    </div>
  );
}
