"use client";

type ManualOverlayProps = {
  open: boolean;
  onClose: () => void;
};

const FEATURES = [
  { feature: "onboardUser(data)", purpose: "Welcome + subscriber entry automation" },
  { feature: "updateWebContent(component, newContent)", purpose: "Mutate dashboard/landing copy via secure bridge" },
  { feature: "handleSupportTicket(query)", purpose: "Categorize and resolve support issues" },
  { feature: "manageNeuralCore(action)", purpose: "Wake / Hibernate / Scale GPU container" },
];

const PHRASES = [
  "MARZ, onboard this user: name Ajay, email ajay@example.com.",
  "MARZ, update hero headline with: Build with grace, ship with power.",
  "MARZ, handle this support ticket: DNS propagation delay.",
  "MARZ, manage neural core action wake now.",
];

export default function ManualOverlay({ open, onClose }: ManualOverlayProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60" role="dialog" aria-modal="true">
      <div className="h-full w-full max-w-xl overflow-y-auto border-l border-amber-500/30 bg-slate-950 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-amber-200">MARZ Operator Manual</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-slate-700 px-3 py-1 text-sm text-slate-300 hover:bg-slate-800"
          >
            Close
          </button>
        </div>

        <div className="mt-5 rounded-xl border border-amber-500/20 bg-slate-900/50 p-4">
          <h4 className="text-sm font-semibold uppercase tracking-[0.1em] text-amber-200">Feature Matrix</h4>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="px-2 py-2 text-amber-100">Capability</th>
                  <th className="px-2 py-2 text-amber-100">What It Does</th>
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((row) => (
                  <tr key={row.feature} className="border-b border-slate-800 last:border-b-0">
                    <td className="px-2 py-2 font-mono text-cyan-200">{row.feature}</td>
                    <td className="px-2 py-2">{row.purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-cyan-500/20 bg-slate-900/50 p-4">
          <h4 className="text-sm font-semibold uppercase tracking-[0.1em] text-cyan-200">What To Say</h4>
          <ul className="mt-3 space-y-2 text-xs text-slate-300">
            {PHRASES.map((line) => (
              <li key={line} className="rounded border border-slate-700 bg-slate-950/60 px-3 py-2 font-mono">
                {line}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
