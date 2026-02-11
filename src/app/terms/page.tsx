import Link from "next/link";

const sections = [
  {
    title: "1. Service Scope",
    items: [
      "OpsVantage provides SaaS capabilities for AI-assisted website planning, generation, deployment, and operations.",
      "Specific feature availability depends on purchased plan and service status.",
      "Enterprise or custom commitments require a signed order form or master services agreement.",
    ],
  },
  {
    title: "2. Customer Responsibilities",
    items: [
      "Provide accurate account and billing information.",
      "Maintain lawful rights to content, trademarks, domains, and data submitted into the platform.",
      "Use the service in compliance with applicable laws and acceptable use standards.",
    ],
  },
  {
    title: "3. Acceptable Use",
    items: [
      "Do not attempt unauthorized access, abuse APIs, or disrupt platform operations.",
      "Do not use the service for malicious code distribution, fraud, or unlawful surveillance.",
      "OpsVantage may suspend or terminate accounts that materially violate these terms.",
    ],
  },
  {
    title: "4. Intellectual Property",
    items: [
      "Customers retain ownership of submitted business content and authorized assets.",
      "OpsVantage retains ownership of platform software, models, and operational tooling.",
      "Feedback may be used to improve the service without transferring customer confidential information.",
    ],
  },
  {
    title: "5. Warranties, Liability, and Termination",
    items: [
      "The service is provided according to applicable contract terms and legally required warranties.",
      "Liability caps, exclusions, and indemnity terms are governed by the signed commercial agreement or default SaaS terms.",
      "Either party may terminate for material breach or legal necessity under the notice terms in the agreement.",
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="mesh-gradient py-10 md:py-14">
      <section className="section-shell">
        <div className="surface-glass p-8 md:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700 dark:text-cyan-300">Terms of Service</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl dark:text-slate-100">
            Terms Governing Use of OpsVantage Digital
          </h1>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">
            Effective date: February 11, 2026. These terms apply to use of OpsVantage websites, applications, and related
            services unless superseded by a signed enterprise agreement.
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">
            Review data practices in our <Link href="/privacy" className="font-semibold text-cyan-700 dark:text-cyan-300">Privacy Policy</Link> and
            control implementation details in our <Link href="/security" className="font-semibold text-cyan-700 dark:text-cyan-300">Security page</Link>.
          </p>
        </div>
      </section>

      <section className="section-shell py-8 pb-16">
        <div className="space-y-4">
          {sections.map((section) => (
            <article key={section.title} className="surface-card">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{section.title}</h2>
              <ul className="mt-4 space-y-2">
                {section.items.map((item) => (
                  <li key={item} className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}