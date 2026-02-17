"use client";

import { useEffect, useMemo, useState } from "react";

type SaturationReading = {
  service: string;
  cpuPercent: number | null;
  gpuPercent: number | null;
  sampledAt: string;
};

type SlaPayload = {
  ok: boolean;
  snapshot: {
    uptime: {
      availabilityPercent: number;
      successfulRequests: number;
      totalRequests: number;
      sampledAt: string;
    };
    latency: {
      appToNeuralMs: number | null;
      usToNeuralMs: number | null;
      target: string;
      sampledAt: string;
    };
    saturation: SaturationReading[];
  };
  suite: {
    suite: string;
    status: "PASS" | "FAIL" | "NOT_RUN";
    accuracy: number;
    videoLinkUnlocked: boolean;
    finishedAt: string | null;
  };
  sampledAt: string;
};

function formatPercent(value: number) {
  return `${value.toFixed(3)}%`;
}

function formatMs(value: number | null) {
  if (value === null) return "n/a";
  return `${value}ms`;
}

function SaturationValue({ value }: { value: number | null }) {
  if (value === null) {
    return <span className="text-slate-400">n/a</span>;
  }

  const stateClass = value >= 85 ? "text-rose-400" : value >= 65 ? "text-amber-400" : "text-emerald-400";
  return <span className={stateClass}>{value.toFixed(2)}%</span>;
}

export function SlaHudClient() {
  const [payload, setPayload] = useState<SlaPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const fetchMetrics = async () => {
      try {
        const response = await fetch(`/api/admin/sla?ts=${Date.now()}`, { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = (await response.json()) as SlaPayload;
        if (!active) return;
        setPayload(data);
        setError(null);
      } catch (fetchError) {
        if (!active) return;
        setError(fetchError instanceof Error ? fetchError.message : "Unable to load SLA metrics.");
      }
    };

    void fetchMetrics();
    const timer = setInterval(() => {
      void fetchMetrics();
    }, 10000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const isGreen = useMemo(() => {
    if (!payload) return false;
    return payload.snapshot.uptime.availabilityPercent >= 99.9 && (payload.snapshot.latency.appToNeuralMs ?? 9999) < 50;
  }, [payload]);

  if (error) {
    return (
      <div className="rounded-xl border border-rose-400/40 bg-rose-900/20 p-4 text-sm text-rose-200">
        SLA feed error: {error}
      </div>
    );
  }

  if (!payload) {
    return <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4 text-slate-300">Loading Sentinel HUD…</div>;
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Uptime Pulse</p>
          <p className="mt-2 text-3xl font-semibold text-cyan-300">{formatPercent(payload.snapshot.uptime.availabilityPercent)}</p>
          <p className="mt-2 text-sm text-slate-400">
            {payload.snapshot.uptime.successfulRequests}/{payload.snapshot.uptime.totalRequests} successful requests
          </p>
        </article>

        <article className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Neural Latency Map</p>
          <div className="mt-2 space-y-1 text-sm text-slate-200">
            <p>Frontend → EU Core: <span className="text-cyan-300">{formatMs(payload.snapshot.latency.appToNeuralMs)}</span></p>
            <p>US Probe → EU Core: <span className="text-cyan-300">{formatMs(payload.snapshot.latency.usToNeuralMs)}</span></p>
            <p className="truncate text-xs text-slate-500">Target: {payload.snapshot.latency.target}</p>
          </div>
        </article>

        <article className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Accuracy Verification</p>
          <p className="mt-2 text-3xl font-semibold text-cyan-300">{payload.suite.accuracy.toFixed(2)}%</p>
          <p className="mt-2 text-sm text-slate-300">Suite: {payload.suite.suite}</p>
          <p className="text-sm text-slate-400">Status: {payload.suite.status}</p>
          <p className="text-sm text-slate-400">Video Link: {payload.suite.videoLinkUnlocked ? "UNLOCKED" : "LOCKED"}</p>
        </article>
      </section>

      <section className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
        <p className="text-xs uppercase tracking-wide text-slate-400">Resource Saturation</p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {payload.snapshot.saturation.map((entry) => (
            <div key={entry.service} className="rounded-lg border border-slate-700 bg-slate-950/60 p-3 text-sm text-slate-200">
              <p className="font-medium text-slate-200">{entry.service}</p>
              <p className="mt-1">CPU: <SaturationValue value={entry.cpuPercent} /></p>
              <p>GPU: <SaturationValue value={entry.gpuPercent} /></p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-700 bg-slate-900/70 p-4 text-sm">
        <p className="text-slate-300">Sentinel State: <span className={isGreen ? "text-emerald-300" : "text-amber-300"}>{isGreen ? "GREEN" : "DEGRADED"}</span></p>
        <p className="text-slate-500">Last sample: {new Date(payload.sampledAt).toLocaleString()}</p>
      </section>
    </div>
  );
}
