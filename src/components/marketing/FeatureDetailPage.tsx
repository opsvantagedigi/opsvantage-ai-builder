import Link from "next/link";

export type ContentCard = {
  title: string;
  description: string;
};

export type ContentMetric = {
  label: string;
  value: string;
};

type FeatureDetailPageProps = {
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  metrics: ContentMetric[];
  pillars: ContentCard[];
  workflow: ContentCard[];
};

export function FeatureDetailPage({
  badge,
  title,
  subtitle,
  description,
  primaryCta,
  secondaryCta,
  metrics,
  pillars,
  workflow,
}: FeatureDetailPageProps) {
  return (
    <div className="mesh-gradient">
      <section className="hero-shell">
        <div className="surface-glass p-8 md:p-12">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-300">{badge}</p>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 md:text-6xl dark:text-slate-100">
            {title} <span className="text-gradient-vibrant">{subtitle}</span>
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-7 text-slate-600 md:text-lg dark:text-slate-300">{description}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={primaryCta.href} className="button-primary">
              {primaryCta.label}
            </Link>
            {secondaryCta && (
              <Link href={secondaryCta.href} className="button-secondary">
                {secondaryCta.label}
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="section-shell pb-8">
        <div className="grid gap-4 md:grid-cols-3">
          {metrics.map((metric) => (
            <article key={metric.label} className="surface-card">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">{metric.label}</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-slate-50">{metric.value}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell py-8">
        <div className="grid gap-4 md:grid-cols-3">
          {pillars.map((pillar) => (
            <article key={pillar.title} className="surface-card">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{pillar.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{pillar.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell py-8 pb-16">
        <div className="surface-card p-8 md:p-10">
          <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl dark:text-slate-100">How It Works</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {workflow.map((step, index) => (
              <article key={step.title} className="rounded-xl border border-slate-200 p-5 dark:border-slate-700">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700 dark:text-cyan-300">
                  Step {index + 1}
                </p>
                <h3 className="mt-2 text-base font-semibold text-slate-900 dark:text-slate-100">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
