import Link from "next/link";

const sections = [
  {
    title: "1. Information We Collect",
    body: [
      "Account data such as name, email, organization, and authentication details.",
      "Operational data such as workspace activity, publishing events, and support interactions.",
      "Billing metadata from payment processors; we do not store full card numbers.",
    ],
  },
  {
    title: "2. How We Use Information",
    body: [
      "Deliver the platform, secure customer accounts, and process transactions.",
      "Provide support, detect abuse, and improve performance and reliability.",
      "Communicate product updates, policy changes, and service notices.",
    ],
  },
  {
    title: "3. Sharing and Subprocessors",
    body: [
      "We share data only with vetted service providers required to operate the platform.",
      "Subprocessors are contractually bound to confidentiality, security, and lawful processing terms.",
      "We do not sell personal information.",
    ],
  },
  {
    title: "4. Retention and Security",
    body: [
      "Data is retained only for legitimate business, legal, and contractual purposes.",
      "OpsVantage applies layered technical and organizational controls including access management, encryption in transit, and logging.",
      "If an account is terminated, data is deleted or anonymized according to retention rules and applicable law.",
    ],
  },
  {
    title: "5. Your Rights",
    body: [
      "Depending on jurisdiction, you may have rights to access, correct, delete, or export personal data.",
      "You may also object to certain processing activities or request restriction of use.",
      "To submit a request, contact privacy@opsvantagedigital.online.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="mesh-gradient py-10 md:py-14">
      <section className="section-shell">
        <div className="surface-glass p-8 md:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700 dark:text-cyan-300">Privacy Policy</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl dark:text-slate-100">
            Privacy Commitments for OpsVantage Digital
          </h1>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">
            Effective date: February 11, 2026. This policy describes how OpsVantage Digital handles personal information
            for customers, prospects, and website visitors.
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">
            For legal agreements governing service use, see the <Link href="/terms" className="font-semibold text-cyan-700 dark:text-cyan-300">Terms of Service</Link>.
          </p>
        </div>
      </section>

      <section className="section-shell py-8 pb-16">
        <div className="space-y-4">
          {sections.map((section) => (
            <article key={section.title} className="surface-card">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{section.title}</h2>
              <ul className="mt-4 space-y-2">
                {section.body.map((item) => (
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