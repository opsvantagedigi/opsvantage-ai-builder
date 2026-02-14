import Link from "next/link";

export default function LegacyArchivePage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100">
      <div className="mx-auto max-w-4xl rounded-2xl border border-amber-500/20 bg-slate-900/70 p-8">
        <p className="text-xs uppercase tracking-[0.14em] text-amber-300/80">Archive</p>
        <h1 className="mt-3 text-3xl font-semibold text-amber-200">Legacy Archive</h1>
        <p className="mt-4 text-sm text-slate-300">
          Legacy records and guidebook references are available from the Sovereign dashboard modules.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/admin/dashboard"
            className="rounded-lg border border-amber-400/40 bg-slate-950 px-3 py-2 text-sm font-medium text-amber-200 transition hover:bg-slate-800"
          >
            Open Sovereign Dashboard
          </Link>
          <Link
            href="/"
            className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
          >
            Return Home
          </Link>
        </div>
      </div>
    </main>
  );
}
