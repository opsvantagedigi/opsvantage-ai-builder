import { DomainSearchInput } from "@/components/features/domain-search";
import { InfrastructureWizard } from "@/components/features/InfrastructureWizard";
import { Globe2, ShieldCheck, Workflow } from "lucide-react";

const domainBenefits = [
  {
    icon: Globe2,
    title: "Broad TLD Coverage",
    description: "Search across mainstream and niche domain extensions for your brand strategy.",
  },
  {
    icon: Workflow,
    title: "Guided Provisioning",
    description: "Move from availability check to secure setup with DNS and SSL readiness in one flow.",
  },
  {
    icon: ShieldCheck,
    title: "Managed Security Posture",
    description: "Apply privacy and certificate configuration standards during onboarding.",
  },
];

export default function DomainsPage() {
  return (
    <div className="mesh-gradient py-10 md:py-14">
      <section className="section-shell">
        <div className="surface-glass p-8 md:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700 dark:text-cyan-300">Domain Management</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl dark:text-slate-100">
            Secure the Right Domain for Your Brand
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
            Search, validate, and prepare your domain setup with integrated operations guidance. OpsVantage helps teams
            reduce setup complexity while keeping launch quality high.
          </p>
        </div>
      </section>

      <section className="section-shell py-8">
        <div className="surface-card p-6 md:p-8">
          <DomainSearchInput />
        </div>
      </section>

      <section className="section-shell py-4">
        <InfrastructureWizard />
      </section>

      <section className="section-shell py-8 pb-16">
        <div className="grid gap-4 md:grid-cols-3">
          {domainBenefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <article key={benefit.title} className="surface-card">
                <Icon className="h-5 w-5 text-cyan-700 dark:text-cyan-300" />
                <h2 className="mt-3 text-lg font-semibold text-slate-900 dark:text-slate-100">{benefit.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{benefit.description}</p>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
