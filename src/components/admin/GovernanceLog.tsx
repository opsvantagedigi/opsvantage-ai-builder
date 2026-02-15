"use client";

import { useEffect, useMemo, useState } from "react";

type GovernanceEvent = {
  id: string;
  timestamp: string;
  type: string;
  description: string;
};

const STORAGE_KEY = "marz-governance-log";

export default function GovernanceLog() {
  const [events, setEvents] = useState<GovernanceEvent[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw) as GovernanceEvent[];
      if (Array.isArray(parsed)) {
        setEvents(parsed.slice(0, 100));
      }
    } catch {
    }
  }, []);

  useEffect(() => {
    const onNeuralLinkEvent = (event: Event) => {
      const custom = event as CustomEvent<{
        type?: string;
        timestamp?: string;
        payload?: {
          tool_call?: {
            name?: string;
            arguments?: Record<string, unknown>;
            status?: string;
          };
          message?: string;
        };
      }>;

      const toolName = custom.detail?.payload?.tool_call?.name || "unknown_tool";
      const status = custom.detail?.payload?.tool_call?.status || "detected";
      const type = custom.detail?.type || "tool_call";
      if (type !== "tool_call") {
        return;
      }

      const record: GovernanceEvent = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        timestamp: custom.detail?.timestamp || new Date().toISOString(),
        type: "tool_call",
        description: `${toolName} (${status})`,
      };

      setEvents((prev) => {
        const next = [record, ...prev].slice(0, 100);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
        }
        return next;
      });
    };

    window.addEventListener("neural-link-event", onNeuralLinkEvent as EventListener);
    return () => {
      window.removeEventListener("neural-link-event", onNeuralLinkEvent as EventListener);
    };
  }, []);

  const rows = useMemo(() => events.slice(0, 10), [events]);

  return (
    <section className="rounded-2xl border border-cyan-500/30 bg-slate-900/50 backdrop-blur-md p-4">
      <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-cyan-200">Governance Log</h3>
      <p className="mt-1 text-xs text-slate-400">Neural-link-event bus listener for MARZ tool execution.</p>

      <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
        {rows.length === 0 ? (
          <p className="text-xs text-slate-500">No tool activity yet.</p>
        ) : (
          rows.map((row) => (
            <div key={row.id} className="rounded-lg border border-cyan-500/20 bg-slate-950/70 px-3 py-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-cyan-200">{row.type}</span>
                <span className="text-slate-400">{new Date(row.timestamp).toLocaleTimeString()}</span>
              </div>
              <p className="mt-1 text-slate-300">{row.description}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
