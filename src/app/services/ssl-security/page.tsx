import Link from "next/link";
import { CheckCircle2, Lock, ShieldCheck, Zap } from "lucide-react";

const sslPlans = [
  {
    name: "Standard SSL",
    price: "$29/yr",
    description: "Best for single sites and early-stage service pages.",
    features: ["Domain validation", "Automated renewal workflow", "Basic trust indicator"],
  },
  {
    name: "Business SSL",
    price: "$89/yr",
    description: "For active brands requiring stronger trust signaling.",
    features: ["Organization validation", "Priority issuance", "Enhanced customer trust"],
    highlight: true,
  },
  {
    name: "Enterprise SSL",
    price: "$199/yr",
    description: "For high-volume operations and compliance-sensitive flows.",
    features: ["Extended validation support", "Advanced liability options", "Managed certificate lifecycle"],
  },
];

export default function SSLSecurityPage() {
  return (
    <div className="mesh-gradient py-10 md:py-14">
      <section className="section-shell">
        <div className="surface-glass p-8 md:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700 dark:text-cyan-300">Security Operations</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl dark:text-slate-100">
            SSL and Trust Infrastructure for Modern Websites
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
            Protect customer traffic with managed TLS workflows, certificate lifecycle operations, and security-first
            launch practices aligned with modern enterprise compliance expectations.
          </p>
        </div>
      </section>

      <section className="section-shell py-8">
        <div className="grid gap-4 md:grid-cols-3">
          {sslPlans.map((plan) => (
            <article
              key={plan.name}
              className={`surface-card ${plan.highlight ? "ring-2 ring-cyan-500 dark:ring-cyan-400" : ""}`}
            >
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{plan.name}</h2>
              <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{plan.price}</p>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{plan.description}</p>
              <ul className="mt-4 space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell py-8 pb-16">
        <div className="surface-card p-8 md:p-10">
          <div className="grid gap-4 md:grid-cols-3">
            <InfoCard
              icon={<Lock className="h-5 w-5 text-cyan-700 dark:text-cyan-300" />}
              title="Encrypted by Default"
              description="All production traffic is secured with TLS and certificate lifecycle checks."
            />
            <InfoCard
              icon={<Zap className="h-5 w-5 text-cyan-700 dark:text-cyan-300" />}
              title="Renewal Workflows"
              description="Avoid certificate expiration risk with managed renewal and visibility controls."
            />
            <InfoCard
              icon={<ShieldCheck className="h-5 w-5 text-cyan-700 dark:text-cyan-300" />}
              title="Operational Confidence"
              description="Publish with confidence using integrated security readiness checks."
            />
          </div>
          <div className="mt-6">
            <Link href="/onboarding" className="button-primary">
              Configure Security in Launch Wizard
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function InfoCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <article className="rounded-xl border border-slate-200 p-5 dark:border-slate-700">
      {icon}
      <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
    </article>
  );
}
