import { DomainSearchInput } from "@/components/features/domain-search";
import { InfrastructureWizard } from "@/components/features/InfrastructureWizard";
import { Globe2, KeyRound, ShieldCheck, ShieldEllipsis, ServerCog, Workflow } from "lucide-react";

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
        <div className="grid gap-4 md:grid-cols-2">
          <article className="surface-card">
            <div className="flex items-start gap-3">
              <Globe2 className="mt-1 h-5 w-5 text-cyan-700 dark:text-cyan-300" />
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Domains</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Live availability checks and suggestions via OpenProvider `domains/check` and `domains/suggest-name`.
                </p>
              </div>
            </div>
          </article>

          <article className="surface-card">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-1 h-5 w-5 text-cyan-700 dark:text-cyan-300" />
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">SSL Certificates</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Product catalog pulled live from OpenProvider `ssl/products` for certificate selection.
                </p>
              </div>
            </div>
          </article>

          <article className="surface-card">
            <div className="flex items-start gap-3">
              <ServerCog className="mt-1 h-5 w-5 text-cyan-700 dark:text-cyan-300" />
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Server Management</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  License offerings retrieved from OpenProvider `licenses/items` (Plesk/Virtuozzo catalog).
                </p>
              </div>
            </div>
          </article>

          <article className="surface-card">
            <div className="flex items-start gap-3">
              <ShieldEllipsis className="mt-1 h-5 w-5 text-cyan-700 dark:text-cyan-300" />
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Security</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  SpamExpert login URL generation via OpenProvider `spam-expert/generate-login-url`.
                </p>
              </div>
            </div>
          </article>
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/70 p-4 text-sm text-slate-700 backdrop-blur dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200">
          <KeyRound className="h-4 w-4 text-cyan-700 dark:text-cyan-300" />
          <p>
            OpenProvider bearer token is cached for ~47 hours and refreshed automatically (check-on-request).
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
