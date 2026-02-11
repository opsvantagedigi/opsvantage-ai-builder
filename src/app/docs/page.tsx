import Link from "next/link";
import { BookOpenText, BotMessageSquare, FileCheck2, Layers3, ServerCog } from "lucide-react";

const docsSections = [
  {
    icon: BookOpenText,
    title: "Platform Overview",
    description: "Understand how OpsVantage connects AI planning, page generation, publishing, and operations.",
    href: "/docs#platform-overview",
  },
  {
    icon: Layers3,
    title: "Implementation Guides",
    description: "Step-by-step setup for projects, workspaces, domains, and launch governance.",
    href: "/docs#implementation-guides",
  },
  {
    icon: ServerCog,
    title: "Deployment Playbooks",
    description: "Cloud Run deployment, environment controls, and production checks for reliable releases.",
    href: "/docs#deployment-playbooks",
  },
  {
    icon: BotMessageSquare,
    title: "AI Workflow Patterns",
    description: "Practical frameworks for prompts, content quality review, and iterative optimization.",
    href: "/docs#ai-workflow-patterns",
  },
];

export default function DocsPage() {
  return (
    <div className="mesh-gradient py-10 md:py-14">
      <section className="section-shell">
        <div className="surface-glass p-8 md:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700 dark:text-cyan-300">Documentation</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl dark:text-slate-100">
            Build With Clarity. Operate With Confidence.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
            This documentation hub is designed for founders, operators, and technical teams running website operations on
            OpsVantage Digital.
          </p>
        </div>
      </section>

      <section className="section-shell py-8" id="platform-overview">
        <div className="grid gap-4 md:grid-cols-2">
          {docsSections.map((section) => {
            const Icon = section.icon;
            return (
              <article key={section.title} className="surface-card">
                <Icon className="h-5 w-5 text-cyan-700 dark:text-cyan-300" />
                <h2 className="mt-3 text-lg font-semibold text-slate-900 dark:text-slate-100">{section.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{section.description}</p>
                <Link href={section.href} className="mt-4 inline-flex text-sm font-semibold text-cyan-700 hover:text-cyan-800 dark:text-cyan-300 dark:hover:text-cyan-200">
                  Read section
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      <section className="section-shell py-8" id="implementation-guides">
        <article className="surface-card p-8 md:p-10">
          <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl dark:text-slate-100">Core Guides</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <GuideCard
              title="Workspace Setup"
              description="Define teams, permissions, and delivery workflows before your first production launch."
            />
            <GuideCard
              title="Content + Design Workflow"
              description="Use AI generation with review checkpoints for quality, consistency, and brand fidelity."
            />
            <GuideCard
              title="Publishing + Operations"
              description="Connect domains, issue certificates, deploy updates, and monitor post-launch performance."
            />
          </div>
        </article>
      </section>

      <section className="section-shell py-8" id="deployment-playbooks">
        <article className="surface-glass p-8 md:p-10">
          <div className="flex items-start gap-3">
            <FileCheck2 className="mt-1 h-5 w-5 text-cyan-700 dark:text-cyan-300" />
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl dark:text-slate-100">Production Readiness Checklist</h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                Confirm domain mapping, SSL, environment variables, and webhook health before every production release.
              </p>
              <div className="mt-5">
                <Link href="/onboarding" className="button-primary">
                  Open Launch Checklist
                </Link>
              </div>
            </div>
          </div>
        </article>
      </section>

      <section className="section-shell py-8 pb-16" id="ai-workflow-patterns">
        <article className="surface-card p-8 md:p-10">
          <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl dark:text-slate-100">AI Workflow Patterns</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            Use a repeatable cycle for high-quality website output: define intent, generate drafts, run structured review,
            and publish with measurable acceptance criteria.
          </p>
          <ul className="mt-4 space-y-2">
            <li className="text-sm text-slate-700 dark:text-slate-200">1. Scope prompt inputs with business outcomes and audience segments.</li>
            <li className="text-sm text-slate-700 dark:text-slate-200">2. Validate copy for clarity, compliance, and conversion readiness.</li>
            <li className="text-sm text-slate-700 dark:text-slate-200">3. Version, publish, and monitor performance feedback loops.</li>
          </ul>
        </article>
      </section>
    </div>
  );
}

function GuideCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-slate-200 p-5 dark:border-slate-700">
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
    </div>
  );
}
