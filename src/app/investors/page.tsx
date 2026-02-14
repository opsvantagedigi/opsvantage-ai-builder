import Link from "next/link";

export default function InvestorsPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-14 text-slate-100">
      <section className="mx-auto max-w-3xl rounded-2xl border border-amber-500/30 bg-slate-900/50 backdrop-blur-md p-8">
        <p className="text-xs uppercase tracking-[0.18em] text-amber-300/80">Private Access</p>
        <h1 className="mt-3 text-3xl font-semibold text-amber-200">OpsVantage Investor Portal</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          This environment is restricted and monitored. Access requests are reviewed manually before telemetry and strategic
          financial projections are exposed.
        </p>

        <div className="mt-6 rounded-xl border border-red-500/30 bg-red-950/30 px-4 py-3 text-sm text-red-200">
          Security Gate Enabled · Identity verification required.
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-xl border border-amber-400/40 bg-slate-950 px-4 py-2 text-sm font-medium text-amber-200 transition hover:bg-slate-800"
          >
            Request Private Access
          </button>
          <Link
            href="/"
            className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
          >
            Return to Operations
          </Link>
        </div>

        <p className="mt-6 text-xs text-slate-400">
          Roadmap Note: This portal will host real-time ROI projections sourced from sovereign telemetry pipelines.
        </p>
      </section>
    </main>
  );
}
