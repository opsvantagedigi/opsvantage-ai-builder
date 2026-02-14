"use client";

import { useEffect, useState } from "react";

function formatClock(date: Date) {
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function DashboardHeader() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-amber-500/20 bg-slate-950/70 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-2">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-200">
          Sovereign Dashboard | OpsVantage Digital
        </p>
        <div className="flex items-center gap-4 text-xs text-slate-300">
          <span className="font-mono text-amber-200">{formatClock(now)}</span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(74,222,128,0.9)]" />
            System Status: Online
          </span>
        </div>
      </div>
    </header>
  );
}
