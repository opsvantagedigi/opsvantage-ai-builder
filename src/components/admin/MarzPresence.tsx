"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

type Mode = "idle" | "speaking" | "intro";

const SOURCES = {
  idle: "/videos/marz-idle.mp4",
  speaking: "/videos/marz-speaking.mp4",
  intro: "/videos/marz-intro.mp4",
};

export function MarzPresence({
  isSpeaking,
  onSummon,
}: {
  isSpeaking: boolean;
  onSummon?: () => void;
}) {
  const videoModeEnabled = process.env.NEXT_PUBLIC_MARZ_VIDEO_MODE === "true";
  const [mode, setMode] = useState<Mode>("idle");
  const [videoAvailable, setVideoAvailable] = useState(videoModeEnabled);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (mode === "intro") return;
    setMode(isSpeaking ? "speaking" : "idle");
  }, [isSpeaking, mode]);

  const activeSrc = useMemo(() => SOURCES[mode], [mode]);

  const handleSummon = async () => {
    onSummon?.();
    if (!videoModeEnabled) return;

    setVideoAvailable(true);
    setMode("intro");

    requestAnimationFrame(async () => {
      try {
        await videoRef.current?.play();
      } catch {
      }
    });
  };

  return (
    <div className="space-y-3">
      <div className="relative w-full aspect-square bg-black/20 rounded-lg overflow-hidden border border-gold/10">
        {videoModeEnabled && videoAvailable ? (
          <video
            ref={videoRef}
            key={activeSrc}
            src={activeSrc}
            className="h-full w-full object-contain p-6"
            autoPlay
            muted
            loop={mode !== "intro"}
            playsInline
            onEnded={() => setMode(isSpeaking ? "speaking" : "idle")}
            onError={() => setVideoAvailable(false)}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center text-xs text-slate-300">
            <Image
              src="/MARZ_Headshot.png"
              alt="MARZ avatar"
              width={220}
              height={280}
              className="h-full max-h-[220px] w-auto rounded-md object-contain"
            />
            <p className="text-[11px] text-slate-300/90">MARZ visual standby mode active.</p>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleSummon}
        className="w-full rounded-lg border border-amber-400/40 bg-slate-950 px-3 py-2 text-sm font-medium text-amber-200 transition hover:bg-slate-800"
      >
        Summon MARZ
      </button>
    </div>
  );
}
