import Link from "next/link";
import { CalendarClock, CheckCircle2, Rocket } from "lucide-react";

const launchDate = "March 13, 2026";

const milestones = [
  "Core AI generation workflows validated",
  "Cloud Run deployment path hardened",
  "Domain and SSL automation in final QA",
  "Production onboarding experience under review",
];

export default function ComingSoonPage() {
  return (
    <div className="mesh-gradient py-10 md:py-14">
      <section className="section-shell">
        <div className="surface-glass p-8 md:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700 dark:text-cyan-300">Launch Update</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl dark:text-slate-100">
            OpsVantage Platform Launching Soon
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
            The core platform is in final activation. We are completing release hardening, observability, and launch
            readiness checks before opening access broadly.
          </p>

          <div className="mt-8 inline-flex items-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-medium text-cyan-800 dark:border-cyan-900/70 dark:bg-cyan-950/40 dark:text-cyan-200">
            <CalendarClock className="h-4 w-4" />
            Target release: {launchDate}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/onboarding" className="button-primary">
              Join Early Access
            </Link>
            <Link href="/docs" className="button-secondary">
              Review Platform Docs
            </Link>
          </div>
        </div>
      </section>

      <section className="section-shell py-8 pb-16">
        <div className="surface-card p-8 md:p-10">
          <div className="mb-6 flex items-center gap-2">
            <Rocket className="h-5 w-5 text-cyan-700 dark:text-cyan-300" />
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Current Milestones</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {milestones.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-500" />
                <p className="text-sm leading-6 text-slate-700 dark:text-slate-200">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
