"use client";

import { useEffect, useMemo, useState } from "react";

const TARGET_ISO_UTC = "2026-03-09T20:00:00Z";

type CountdownParts = {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function getParts(targetMs: number): CountdownParts {
  const delta = Math.max(0, targetMs - Date.now());
  const days = Math.floor(delta / (1000 * 60 * 60 * 24));
  const hours = Math.floor((delta / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((delta / (1000 * 60)) % 60);
  const seconds = Math.floor((delta / 1000) % 60);

  return {
    totalMs: delta,
    days,
    hours,
    minutes,
    seconds,
  };
}

export default function NexusCountdown() {
  const targetMs = useMemo(() => new Date(TARGET_ISO_UTC).getTime(), []);
  const [parts, setParts] = useState<CountdownParts>(() => getParts(targetMs));

  useEffect(() => {
    const interval = setInterval(() => {
      setParts(getParts(targetMs));
    }, 250);

    return () => clearInterval(interval);
  }, [targetMs]);

  return (
    <div className="mt-8 rounded-2xl border border-amber-400/30 bg-slate-950/60 p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-amber-300/80">Launch Countdown · March 10, 2026 · 09:00 AM NZDT</p>
      <div className="mt-3 grid grid-cols-4 gap-2 text-center">
        {[{ label: "Days", value: parts.days }, { label: "Hours", value: parts.hours }, { label: "Minutes", value: parts.minutes }, { label: "Seconds", value: parts.seconds }].map(
          (item) => (
            <div key={item.label} className="rounded-xl border border-amber-500/20 bg-slate-900/70 px-2 py-3">
              <p className="text-2xl font-semibold text-amber-200">{String(item.value).padStart(2, "0")}</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-slate-400">{item.label}</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
