import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

const tiers = [
  {
    name: "Starter",
    price: "$29",
    cadence: "/month",
    summary: "For solo founders validating one offer.",
    features: [
      "1 production website",
      "Core AI generation workflows",
      "Managed hosting + SSL",
      "Email support",
    ],
    cta: { label: "Start Starter", href: "/onboarding" },
  },
  {
    name: "Pro",
    price: "$79",
    cadence: "/month",
    summary: "For operators growing multiple funnels and pages.",
    features: [
      "5 production websites",
      "Advanced AI workflows",
      "Custom domain management",
      "Team collaboration",
      "Priority support",
    ],
    cta: { label: "Start Pro", href: "/onboarding" },
    highlight: true,
  },
  {
    name: "Agency",
    price: "$249",
    cadence: "/month",
    summary: "For agencies managing many client environments.",
    features: [
      "20 production websites",
      "Multi-workspace governance",
      "Client-ready handoff workflows",
      "Usage analytics",
      "Dedicated onboarding support",
    ],
    cta: { label: "Talk to Sales", href: "/enterprise" },
  },
];

export default function PricingPage() {
  return (
    <div className="mesh-gradient py-10 md:py-14">
      <section className="section-shell">
        <div className="surface-glass p-8 md:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700 dark:text-cyan-300">Pricing</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl dark:text-slate-100">
            Plans for High-Performance Website Operations
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
            Every plan includes core platform capabilities: AI architecture, managed deployment, domain support, and
            production-grade infrastructure.
          </p>
        </div>
      </section>

      <section className="section-shell py-8 pb-12">
        <div className="grid gap-4 md:grid-cols-3">
          {tiers.map((tier) => (
            <article
              key={tier.name}
              className={`surface-card flex h-full flex-col ${tier.highlight ? "ring-2 ring-cyan-500 dark:ring-cyan-400" : ""}`}
            >
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{tier.name}</p>
                <p className="mt-2 text-4xl font-semibold text-slate-900 dark:text-slate-100">
                  {tier.price}
                  <span className="text-base font-medium text-slate-500 dark:text-slate-400">{tier.cadence}</span>
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{tier.summary}</p>
              </div>

              <ul className="mt-6 space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Link href={tier.cta.href} className={tier.highlight ? "button-primary w-full" : "button-secondary w-full"}>
                  {tier.cta.label}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
