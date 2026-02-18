'use client';

import { useEffect, useMemo, useState } from 'react';

type HudPayload = {
  sampledAt?: string;
  neural?: {
    ttsLatencyMs?: number | null;
    lipSyncFps?: number | null;
    phi3InferenceMs?: number | null;
  };
};

type HealthState = 'green' | 'yellow' | 'red' | 'unknown';

function getLatencyState(ms: number | null | undefined): HealthState {
  if (ms === null || ms === undefined) return 'unknown';
  if (ms < 500) return 'green';
  if (ms <= 1200) return 'yellow';
  return 'red';
}

function getFpsState(fps: number | null | undefined): HealthState {
  if (fps === null || fps === undefined) return 'unknown';
  if (fps >= 45) return 'green';
  if (fps >= 30) return 'yellow';
  return 'red';
}

function stateClass(state: HealthState) {
  switch (state) {
    case 'green':
      return 'text-emerald-300';
    case 'yellow':
      return 'text-amber-300';
    case 'red':
      return 'text-rose-300';
    default:
      return 'text-slate-400';
  }
}

function formatMs(value: number | null | undefined) {
  if (value === null || value === undefined) return 'n/a';
  return `${Math.round(value)}ms`;
}

function formatFps(value: number | null | undefined) {
  if (value === null || value === undefined) return 'n/a';
  return `${value.toFixed(1)} fps`;
}

export function SlaHudOverlay() {
  const [payload, setPayload] = useState<HudPayload | null>(null);
  const [hidden, setHidden] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const res = await fetch(`/api/admin/sla?ts=${Date.now()}`, { cache: 'no-store' });
        if (res.status === 401 || res.status === 403) {
          if (active) setHidden(true);
          return;
        }
        if (!res.ok) {
          throw new Error(`Request failed (${res.status})`);
        }
        const data = (await res.json()) as HudPayload;
        if (!active) return;
        setPayload(data);
        setError(null);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Unable to load SLA HUD.');
      }
    };

    void load();
    const id = setInterval(load, 12_000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  const neural = payload?.neural;
  const ttsState = useMemo(() => getLatencyState(neural?.ttsLatencyMs ?? null), [neural?.ttsLatencyMs]);
  const lipState = useMemo(() => getFpsState(neural?.lipSyncFps ?? null), [neural?.lipSyncFps]);
  const phi3State = useMemo(() => getLatencyState(neural?.phi3InferenceMs ?? null), [neural?.phi3InferenceMs]);

  if (hidden) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[280px] rounded-2xl border border-slate-700/70 bg-slate-950/90 p-4 text-xs text-slate-200 shadow-[0_16px_40px_rgba(15,23,42,0.55)] backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">SLA HUD</p>
          <p className="mt-1 text-sm font-semibold text-slate-100">Neural Response Monitor</p>
        </div>
        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          className="rounded-lg border border-slate-700 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-400"
        >
          {collapsed ? 'Expand' : 'Collapse'}
        </button>
      </div>

      {error ? (
        <div className="mt-3 rounded-lg border border-rose-500/40 bg-rose-950/40 px-3 py-2 text-[11px] text-rose-200">
          {error}
        </div>
      ) : null}

      {!collapsed && (
        <div className="mt-4 space-y-3">
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2">
            <div className="flex items-center justify-between">
              <span className="uppercase tracking-[0.18em] text-[10px] text-slate-500">TTS_LATENCY</span>
              <span className={stateClass(ttsState)}>{formatMs(neural?.ttsLatencyMs)}</span>
            </div>
            <p className="mt-1 text-[10px] text-slate-500">Green &lt; 500ms · Yellow 500–1200ms · Red &gt; 1200ms</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2">
            <div className="flex items-center justify-between">
              <span className="uppercase tracking-[0.18em] text-[10px] text-slate-500">LIP_SYNC_FRAME_RATE</span>
              <span className={stateClass(lipState)}>{formatFps(neural?.lipSyncFps)}</span>
            </div>
            <p className="mt-1 text-[10px] text-slate-500">Green ≥ 45fps · Yellow 30–44fps · Red &lt; 30fps</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2">
            <div className="flex items-center justify-between">
              <span className="uppercase tracking-[0.18em] text-[10px] text-slate-500">PH_3_INFERENCE_TIME</span>
              <span className={stateClass(phi3State)}>{formatMs(neural?.phi3InferenceMs)}</span>
            </div>
            <p className="mt-1 text-[10px] text-slate-500">Green &lt; 500ms · Yellow 500–1200ms · Red &gt; 1200ms</p>
          </div>

          <p className="text-[10px] text-slate-500">Sampled: {payload?.sampledAt ? new Date(payload.sampledAt).toLocaleTimeString() : 'n/a'}</p>
        </div>
      )}
    </div>
  );
}
