import Link from "next/link";
import { ArrowRight, Lock, Scale, ShieldCheck } from "lucide-react";

const legalSections = [
  {
    href: "/privacy",
    title: "Privacy Policy",
    description:
      "How OpsVantage collects, uses, protects, and retains personal data across product and support workflows.",
    icon: Lock,
  },
  {
    href: "/terms",
    title: "Terms of Service",
    description:
      "Commercial terms, acceptable use expectations, ownership boundaries, and service availability commitments.",
    icon: Scale,
  },
  {
    href: "/security",
    title: "Security Overview",
    description:
      "Platform security controls, incident response standards, and compliance mapping for procurement reviews.",
    icon: ShieldCheck,
  },
];

export default function LegalCenterPage() {
  return (
    <div className="mesh-gradient py-10 md:py-14">
      <section className="section-shell">
        <div className="surface-glass p-8 md:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700 dark:text-cyan-300">Legal Center</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl dark:text-slate-100">
            Trust, Security, and Legal Standards
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
            This hub centralizes policies and governance references used by customers, partners, and procurement teams. For
            legal notices, data rights requests, or security assessments, use the pages below.
          </p>
        </div>
      </section>

      <section className="section-shell py-8 pb-16">
        <div className="grid gap-4 md:grid-cols-3">
          {legalSections.map((section) => {
            const Icon = section.icon;
            return (
              <article key={section.href} className="surface-card flex h-full flex-col">
                <Icon className="h-5 w-5 text-cyan-700 dark:text-cyan-300" />
                <h2 className="mt-4 text-xl font-semibold text-slate-900 dark:text-slate-100">{section.title}</h2>
                <p className="mt-3 flex-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{section.description}</p>
                <Link
                  href={section.href}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cyan-700 hover:text-cyan-800 dark:text-cyan-300 dark:hover:text-cyan-200"
                >
                  Open policy
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}