'use client';

import { useEffect, useMemo, useState } from 'react';

type OfferStatus = {
  offerId: string;
  claimed: number;
  limit: number | null;
  remaining: number | null;
  exhausted: boolean;
};

export function SovereignTicker() {
  const [status, setStatus] = useState<OfferStatus | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch('/api/claims/status?offerId=sovereign-25', { cache: 'no-store' });
        const json = (await res.json()) as { offers?: Record<string, OfferStatus> };
        const next = json?.offers?.['sovereign-25'] ?? null;
        if (!cancelled) setStatus(next);
      } catch {
        if (!cancelled) setStatus(null);
      }
    }

    load();
    const id = setInterval(load, 15_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const remainingLabel = useMemo(() => {
    if (!status) return 'Loading…';
    if (status.remaining === null) return 'Live';
    return `${status.remaining}`;
  }, [status]);

  return (
    <div className="surface-card relative overflow-hidden border border-cyan-200/60 bg-gradient-to-br from-white/80 via-white/40 to-cyan-50/70 p-6 dark:border-cyan-900/50 dark:from-slate-950/80 dark:via-slate-950/50 dark:to-cyan-950/40">
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-cyan-200/30 blur-2xl dark:bg-cyan-500/20" />
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700 dark:text-cyan-300">Sovereign 25</p>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-4xl font-semibold text-slate-900 dark:text-white">{remainingLabel}</span>
        <span className="text-sm text-slate-500 dark:text-slate-400">spots left</span>
      </div>
      <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
        The first 25 founders receive lifetime advantages, priority launch assistance, and direct MARZ access.
      </p>
      <div className="mt-4 inline-flex items-center rounded-full border border-amber-200/70 bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700 dark:border-amber-900/70 dark:bg-amber-950/40 dark:text-amber-200">
        Live scarcity signal
      </div>
    </div>
  );
}
