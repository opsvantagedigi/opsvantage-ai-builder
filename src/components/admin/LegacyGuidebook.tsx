"use client";

import { useMemo, useState } from "react";

type GuideEntry = {
  id: number;
  title: string;
  body: string;
  pinned?: boolean;
};

const ENTRIES: GuideEntry[] = [
  {
    id: 35,
    title: "Entry #35 · The Manifestation Engine",
    pinned: true,
    body: `## Manifestation Protocol\n\n- Identity, Logic, and Execution are synchronized as one command fabric.\n- Every completed task is transformed into an autonomous thought record.\n- Mission Control converts direction into visible forward movement without drift.\n\n## Grounding Principle\n\nBuild from truth, ship with discipline, and let measurable progress compound.`,
  },
  {
    id: 34,
    title: "Entry #34 · Mission Control Convergence",
    body: `## Strategic Record\n\n- Visual cockpit alignment reached across MARZ presence and sovereign controls.\n- Neural activation pipeline normalized for resilient text fallback.\n- Task orchestration integrated with autonomous thought logging.\n\n## Operator Directive\n\nProtect coherence, move deliberately, and ship with graceful precision.`,
  },
  {
    id: 33,
    title: "Entry #33 · Sovereign Interface Hardening",
    body: `## Progress\n\n- Browser-only APIs wrapped in client-safe guards.\n- Hydration mismatch pressure reduced in critical surfaces.\n- Brand identity pathways synchronized across shell components.`,
  },
];

export function LegacyGuidebook() {
  const [selectedEntryId, setSelectedEntryId] = useState<number>(35);

  const selectedEntry = useMemo(
    () => ENTRIES.find((entry) => entry.id === selectedEntryId) ?? ENTRIES[0],
    [selectedEntryId]
  );

  return (
    <section className="rounded-2xl border border-amber-500/30 bg-slate-900/50 backdrop-blur-md p-5 h-full min-h-[300px]">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-amber-200">Legacy Guidebook</h3>
        <button
          type="button"
          className="rounded-md border border-amber-500/30 bg-slate-950/70 px-3 py-1.5 text-xs text-amber-200 transition hover:bg-slate-800"
        >
          Generate New Entry
        </button>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {ENTRIES.map((entry) => (
          <button
            key={entry.id}
            type="button"
            onClick={() => setSelectedEntryId(entry.id)}
            className={`rounded-md border px-2.5 py-1 text-xs transition ${
              selectedEntryId === entry.id
                ? "border-amber-400/70 bg-amber-500/10 text-amber-200"
                : "border-slate-700 bg-slate-950/70 text-slate-300 hover:border-amber-500/40"
            }`}
          >
            Entry #{entry.id}{entry.pinned ? " • Pinned" : ""}
          </button>
        ))}
      </div>

      <div className="h-[220px] overflow-y-auto rounded-lg border border-amber-500/20 bg-gradient-to-b from-stone-900/80 via-slate-950/90 to-black/90 p-4 shadow-inner">
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.12em] text-amber-300/80">{selectedEntry.title}</p>
        <pre className="whitespace-pre-wrap font-mono text-sm leading-6 text-stone-200">{selectedEntry.body}</pre>
      </div>
    </section>
  );
}
