"use client";

const DIFFERENTIATORS = [
  "Sovereign AI Infrastructure (Local-first, No-trace logic).",
  "Autonomous Project Orchestration (MARZ-led growth).",
  "Self-Sustaining Monetization (Recursive DFY Sales Funnels).",
  "Enterprise Scalability (Cloud Run Revision 00055 Architecture).",
];

export function Fortune500Metrics() {
  return (
    <section className="rounded-2xl bg-gradient-to-r from-slate-600 via-amber-300 to-slate-600 p-[1px]">
      <div className="rounded-2xl border border-transparent bg-slate-900/50 backdrop-blur-md p-5">
        <h3 className="text-lg font-semibold text-amber-200">OpsVantage Sovereign Metrics (F500 Roadmap)</h3>
        <p className="mt-2 text-xs uppercase tracking-[0.12em] text-slate-400">F500 Competitive Differentiators</p>
        <ul className="mt-4 space-y-2 text-sm text-slate-200">
          {DIFFERENTIATORS.map((item) => (
            <li key={item} className="rounded-lg border border-amber-500/20 bg-slate-950/60 px-3 py-2">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
