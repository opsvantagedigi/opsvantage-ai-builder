type MentorLogEntry = {
  category: string;
  insight: string;
  createdAt?: string;
};

export default function MentorLog({ entries }: { entries: MentorLogEntry[] }) {
  const visibleEntries = entries.slice(0, 8);

  return (
    <section className="mt-6 rounded-2xl border border-amber-500/30 bg-black/70 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-amber-200">Mentor&apos;s Log</h2>
        <span className="text-xs text-slate-500">Legacy Archive</span>
      </div>

      <div className="space-y-3">
        {visibleEntries.length === 0 ? (
          <p className="text-sm text-slate-500">Archive is initializing...</p>
        ) : (
          visibleEntries.map((entry, index) => {
            const dateLabel = entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : "Historical";
            return (
              <article
                key={`${entry.category}-${index}-${entry.insight.slice(0, 16)}`}
                className="rounded-xl border border-amber-500/20 bg-slate-900/60 px-4 py-3"
              >
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.12em]">
                  <span className="text-amber-300/80">{entry.category}</span>
                  <span className="text-slate-500">{dateLabel}</span>
                </div>
                <p className="mt-2 text-sm text-slate-300">{entry.insight}</p>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
