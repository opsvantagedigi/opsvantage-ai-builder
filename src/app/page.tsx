import Link from "next/link";
import { ArrowRight, CheckCircle2, Cpu, Gauge, Globe2, ShieldCheck, Sparkles } from "lucide-react";

const coreCapabilities = [
  {
    icon: Cpu,
    title: "AI Architecture",
    description:
      "Translate business requirements into structured page maps, conversion flows, and component-ready briefs.",
  },
  {
    icon: Globe2,
    title: "Domain + Hosting",
    description:
      "Secure domains, provision SSL, and deploy globally from one operations console.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by Default",
    description:
      "Role-based access, controlled publishing workflows, and managed infrastructure guardrails.",
  },
  {
    icon: Gauge,
    title: "Operational Analytics",
    description:
      "Track delivery velocity, performance signals, and optimization opportunities across launches.",
  },
];

const outcomes = [
  "Reduce website planning and production cycles",
  "Standardize brand consistency across all pages",
  "Improve conversion readiness before first launch",
  "Scale digital operations without adding workflow complexity",
];

export default function LandingPage() {
  return (
    <div className="mesh-gradient">
      <section className="hero-shell">
        <div className="surface-glass p-8 md:p-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700 dark:border-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-300">
            <Sparkles className="h-3.5 w-3.5" />
            Autonomous AI Website Builder
          </div>

          <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-tight text-slate-900 md:text-6xl dark:text-slate-100">
            Build Enterprise-Grade Websites Faster with
            <span className="text-gradient-vibrant"> OpsVantage Digital</span>
          </h1>

          <p className="mt-6 max-w-3xl text-base leading-7 text-slate-600 md:text-lg dark:text-slate-300">
            OpsVantage helps founders and teams design, launch, and operate high-performance websites with one integrated
            platform. From AI planning to domain, hosting, and security, every step is connected.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/onboarding" className="button-primary">
              Start Building
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link href="/pricing" className="button-secondary">
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      <section className="section-shell pb-8">
        <div className="grid gap-4 md:grid-cols-4">
          {coreCapabilities.map((capability) => {
            const Icon = capability.icon;
            return (
              <article key={capability.title} className="surface-card">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-cyan-300">
                  <Icon className="h-5 w-5" />
                </span>
                <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">{capability.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{capability.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="section-shell py-8">
        <div className="surface-card p-8 md:p-10">
          <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl dark:text-slate-100">Why Teams Choose OpsVantage</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {outcomes.map((outcome) => (
              <div key={outcome} className="flex items-start gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-500" />
                <p className="text-sm leading-6 text-slate-700 dark:text-slate-200">{outcome}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell py-8 pb-16">
        <div className="surface-glass flex flex-col items-start justify-between gap-6 p-8 md:flex-row md:items-center md:p-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700 dark:text-cyan-300">Launch Ready</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">Turn Strategy into a Live Website</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              Use guided onboarding to generate your architecture, then publish with domain and security workflows built in.
            </p>
          </div>
          <Link href="/onboarding" className="button-primary">
            Open Launch Wizard
          </Link>
        </div>
      </section>
    </div>
  );
}
