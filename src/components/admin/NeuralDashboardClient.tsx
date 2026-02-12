"use client";

import Link from "next/link";
import React from "react";
import { useEffect, useMemo, useRef, useState } from "react";

type Thought = {
  category: string;
  insight: string;
  createdAt?: string;
};

type Telemetry = {
  generatedAt: string;
  sovereign25SlotsRemaining: number;
  openProviderStatus: "green" | "red";
  marzThoughts: Thought[];
};

type ImpactReport = {
  totals?: {
    totalSavingsUsd?: number;
  };
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export default function NeuralDashboardClient({ initialThoughts }: { initialThoughts: Thought[] }) {
  const [mounted, setMounted] = React.useState(false);
  const [telemetry, setTelemetry] = useState<Telemetry | null>(null);
  const [thoughts, setThoughts] = useState<Thought[]>(initialThoughts);
  const [nzdSaved, setNzdSaved] = useState(0);
  const [loading, setLoading] = useState(true);
  const [switchOpen, setSwitchOpen] = useState(false);
  const [confirmCode, setConfirmCode] = useState("");
  const [globalLaunchActive, setGlobalLaunchActive] = useState(false);
  const [switchBusy, setSwitchBusy] = useState(false);
  const terminalRef = useRef<HTMLDivElement | null>(null);
  const telemetrySnapshotRef = useRef<string>("");
  const thoughtsSnapshotRef = useRef<string>(JSON.stringify(initialThoughts));
  const impactSnapshotRef = useRef<number>(0);
  const launchSnapshotRef = useRef<boolean>(false);
  const hasRedirectedRef = useRef(false);

  React.useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;

    let isActive = true;

    const loadTelemetry = async () => {
      try {
        const response = await fetch("/api/admin/telemetry", { cache: "no-store" });
        if (response.status === 401 && !hasRedirectedRef.current) {
          const authProbe = await fetch("/api/admin/impact-report", { cache: "no-store" });
          if (authProbe.status === 401) {
            hasRedirectedRef.current = true;
            window.location.replace("/sovereign-access");
            return;
          }
        }

        if (!response.ok) return;
        const payload = (await response.json()) as Telemetry;
        if (!isActive) return;
        const telemetrySnapshot = JSON.stringify(payload);
        if (telemetrySnapshotRef.current !== telemetrySnapshot) {
          telemetrySnapshotRef.current = telemetrySnapshot;
          setTelemetry(payload);
        }

        const thoughtsSnapshot = JSON.stringify(payload.marzThoughts);
        if (thoughtsSnapshotRef.current !== thoughtsSnapshot) {
          thoughtsSnapshotRef.current = thoughtsSnapshot;
          setThoughts(payload.marzThoughts);
        }

        const impactResponse = await fetch("/api/admin/impact-report", { cache: "no-store" });
        if (impactResponse.ok) {
          const impactPayload = (await impactResponse.json()) as ImpactReport;
          const usd = impactPayload?.totals?.totalSavingsUsd ?? 0;
          const nzd = usd * 1.62;
          const rounded = Number(nzd.toFixed(2));
          if (impactSnapshotRef.current !== rounded) {
            impactSnapshotRef.current = rounded;
            setNzdSaved(rounded);
          }
        }

        const switchResponse = await fetch("/api/admin/kill-switch", { cache: "no-store" });
        if (switchResponse.ok) {
          const switchPayload = (await switchResponse.json()) as { globalLaunchActive?: boolean };
          const nextLaunchState = Boolean(switchPayload.globalLaunchActive);
          if (launchSnapshotRef.current !== nextLaunchState) {
            launchSnapshotRef.current = nextLaunchState;
            setGlobalLaunchActive(nextLaunchState);
          }
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    void loadTelemetry();
    const interval = setInterval(() => {
      void loadTelemetry();
    }, 15000);

    return () => {
      isActive = false;
      clearInterval(interval);
    };
  }, [mounted]);

  const thoughtLines = useMemo(() => {
    if (!thoughts?.length) return [];
    return thoughts.slice(0, 50).map((thought, index) => {
      const timestamp = thought.createdAt
        ? new Date(thought.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : `T+${index + 1}`;
      const normalizedCategory = (thought.category || "STRATEGY").toUpperCase();
      return `[${timestamp}] [${normalizedCategory}] ${thought.insight}`;
    });
  }, [thoughts]);

  const handleKillSwitch = async () => {
    setSwitchBusy(true);
    try {
      const response = await fetch("/api/admin/kill-switch", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          globalLaunchActive: !globalLaunchActive,
          confirmCode,
        }),
      });

      if (!response.ok) return;
      const payload = (await response.json()) as { globalLaunchActive?: boolean };
      setGlobalLaunchActive(Boolean(payload.globalLaunchActive));
      setSwitchOpen(false);
      setConfirmCode("");
    } finally {
      setSwitchBusy(false);
    }
  };

  useEffect(() => {
    if (!mounted) return;
    if (!terminalRef.current) return;
    terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
  }, [mounted, thoughtLines]);

  if (!mounted) return <div className="min-h-screen bg-black" />;

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-amber-500/20 pb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-amber-300/80">Zenith Command Center</p>
            <h1 className="mt-2 text-3xl font-semibold text-amber-200">Neural Thought Dashboard</h1>
            <p className="mt-2 text-sm text-slate-400">Fortune-grade oversight for sovereign infrastructure operations.</p>
          </div>
          <Link
            href="/services"
            className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-sm font-medium text-amber-200 transition hover:bg-amber-400/20"
          >
            View Public Services
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-amber-500/30 bg-slate-900/70 p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Sovereign 25</p>
            <p className="mt-2 text-3xl font-bold text-cyan-300 animate-pulse">
              {loading ? "--" : telemetry?.sovereign25SlotsRemaining ?? 0}
            </p>
            <p className="mt-1 text-sm text-slate-400">Slots Remaining</p>
          </div>

          <div className="rounded-2xl border border-amber-500/30 bg-slate-900/70 p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Economic Impact</p>
            <p className="mt-2 text-3xl font-bold text-cyan-300 animate-pulse">
              {loading ? "--" : formatCurrency(nzdSaved).replace("$", "NZ$")}
            </p>
            <p className="mt-1 text-sm text-slate-400">New Zealand Dollars Saved</p>
          </div>

          <div className="rounded-2xl border border-amber-500/30 bg-slate-900/70 p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">OpenProvider API</p>
            <div className="mt-3 flex items-center gap-3">
              <span
                className={`h-3 w-3 rounded-full ${
                  telemetry?.openProviderStatus === "green"
                    ? "animate-pulse bg-emerald-400 shadow-[0_0_16px_rgba(74,222,128,0.8)]"
                    : "animate-pulse bg-red-400 shadow-[0_0_16px_rgba(248,113,113,0.8)]"
                }`}
              />
              <span className="text-lg font-semibold text-amber-200">
                {loading ? "Checking..." : telemetry?.openProviderStatus === "green" ? "Operational" : "Degraded"}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-500/30 bg-slate-900/70 p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Global Kill Switch</p>
            <p className={`mt-2 text-lg font-semibold ${globalLaunchActive ? "text-emerald-300" : "text-amber-200"}`}>
              {globalLaunchActive ? "Launch Active" : "Launch Guarded"}
            </p>
            <button
              onClick={() => setSwitchOpen(true)}
              className="mt-3 rounded-lg border border-amber-400/40 bg-slate-950 px-3 py-2 text-sm font-medium text-amber-200 transition hover:bg-slate-800"
            >
              {globalLaunchActive ? "Deactivate Global Launch" : "Activate Global Launch"}
            </button>
          </div>
        </div>

        <section className="mt-6 rounded-2xl border border-amber-500/30 bg-black/70 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-amber-200">Marz Autonomous Thoughts</h2>
            <span className="text-xs text-slate-500">Refresh: 15s</span>
          </div>

          <div
            ref={terminalRef}
            className="h-[430px] overflow-y-auto rounded-xl border border-amber-500/20 bg-black px-4 py-3 font-mono text-sm leading-6 text-emerald-300"
          >
            {thoughtLines.length === 0 ? (
              <p className="text-slate-500">Awaiting neural thought stream...</p>
            ) : (
              thoughtLines.map((line, index) => (
                <p key={`${line}-${index}`} className="whitespace-pre-wrap">
                  {line}
                </p>
              ))
            )}
          </div>
        </section>

        {switchOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
            <div className="w-full max-w-md rounded-2xl border border-amber-500/40 bg-slate-950 p-6">
              <h3 className="text-xl font-semibold text-amber-200">Safety Cover Confirmation</h3>
              <p className="mt-2 text-sm text-slate-300">
                Type <span className="font-semibold text-cyan-300">LAUNCH</span> to confirm this global launch state change.
              </p>
              <input
                value={confirmCode}
                onChange={(event) => setConfirmCode(event.target.value)}
                className="mt-4 w-full rounded-xl border border-amber-500/30 bg-slate-900 px-3 py-2 text-slate-100"
                placeholder="LAUNCH"
              />
              <div className="mt-5 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setSwitchOpen(false);
                    setConfirmCode("");
                  }}
                  className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300"
                >
                  Cancel
                </button>
                <button
                  disabled={switchBusy || confirmCode !== "LAUNCH"}
                  onClick={handleKillSwitch}
                  className="rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 px-3 py-2 text-sm font-semibold text-slate-950 disabled:opacity-50"
                >
                  {switchBusy ? "Applying..." : "Confirm Switch"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
