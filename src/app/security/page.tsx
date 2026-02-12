import Link from "next/link";
import { CheckCircle2, ShieldCheck } from "lucide-react";

const commitments = [
  {
    title: "Our Security Philosophy",
    content:
      "At OpsVantage, security is not a feature; it is the substrate upon which MARZ is built. Our Information Security Management System is aligned to ISO/IEC 27001 principles for confidentiality, integrity, and availability.",
  },
  {
    title: "Data Protection & Encryption",
    bullets: [
      "In transit: Browser and API traffic is encrypted with TLS 1.2+.",
      "At rest: Project data and managed secrets are protected with AES-256 controls in Google Cloud infrastructure.",
      "Database isolation: Prisma ORM connections to PostgreSQL enforce SSL/TLS and scoped credentials.",
    ],
  },
  {
    title: "AI Ethics & Privacy Shield (Gemini Integration)",
    bullets: [
      "Zero training data leakage: Customer prompts and business context are not used to train Gemini models without explicit customer permission.",
      "Contextual isolation: MARZ execution context is tenant-scoped to prevent cross-account data exposure.",
    ],
  },
  {
    title: "Infrastructure Hardening (Google Cloud Run)",
    bullets: [
      "Stateless execution: Runtime containers process requests without persisting customer payloads between requests.",
      "Identity and Access Management: Least-Privilege IAM is enforced across platform services and automation paths.",
    ],
  },
];

const complianceRows = [
  {
    domain: "Access Management",
    control: "Role-based workspace permissions, restricted admin paths, and session verification.",
    mapping: "ISO 27001 A.5, SOC 2 CC6, NIST AC",
    status: "Implemented",
  },
  {
    domain: "Data Security",
    control: "TLS transport controls, encrypted storage posture, and environment secret governance.",
    mapping: "ISO 27001 A.8, SOC 2 CC6/CC8, NIST SC",
    status: "Implemented",
  },
  {
    domain: "Operational Monitoring",
    control: "Audit logs, production health checks, and deployment validation workflows.",
    mapping: "ISO 27001 A.12, SOC 2 CC7, NIST AU",
    status: "Implemented",
  },
  {
    domain: "Incident Readiness",
    control: "Escalation paths, security reporting channel, and post-incident review process.",
    mapping: "ISO 27001 A.5/A.6, SOC 2 CC7, NIST IR",
    status: "Documented",
  },
];

const roadmap = ["SOC 2 Type II certification", "GDPR / CCPA compliance modules", "Expanded automated audit logging coverage"];

export default function SecurityPage() {
  return (
    <div className="mesh-gradient py-10 md:py-14">
      <section className="section-shell">
        <div className="surface-glass p-8 md:p-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700 dark:border-cyan-900/60 dark:bg-cyan-950/40 dark:text-cyan-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            OpsVantage Security Commitment
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl dark:text-slate-100">
            Enterprise-Grade Protection for the Next Generation of AI Innovation
          </h1>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">
            This page defines measurable controls, architecture posture, and compliance direction for procurement and IT
            audit teams evaluating OpsVantage and MARZ.
          </p>
        </div>
      </section>

      <section className="section-shell py-8">
        <div className="grid gap-4">
          {commitments.map((item) => (
            <article key={item.title} className="surface-card">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{item.title}</h2>
              {item.content && <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.content}</p>}
              {item.bullets && (
                <ul className="mt-4 space-y-2">
                  {item.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-500" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell py-8">
        <article className="surface-card overflow-x-auto p-0">
          <div className="border-b border-slate-200 px-6 py-5 dark:border-slate-800">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Control Mapping Snapshot</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Reference matrix used for enterprise security due diligence.
            </p>
          </div>
          <table className="min-w-full divide-y divide-slate-200 text-left dark:divide-slate-800">
            <thead className="bg-slate-100/80 dark:bg-slate-900">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600 dark:text-slate-300">Domain</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600 dark:text-slate-300">Control</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600 dark:text-slate-300">Framework Mapping</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600 dark:text-slate-300">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {complianceRows.map((row) => (
                <tr key={row.domain}>
                  <td className="px-4 py-4 text-sm font-semibold text-slate-900 dark:text-slate-100">{row.domain}</td>
                  <td className="px-4 py-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{row.control}</td>
                  <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300">{row.mapping}</td>
                  <td className="px-4 py-4 text-sm">
                    <span className="inline-flex rounded-full border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      </section>

      <section className="section-shell pb-16">
        <div className="surface-card p-8 md:p-10">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Compliance Roadmap</h2>
          <ul className="mt-4 space-y-2">
            {roadmap.map((item) => (
              <li key={item} className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            For vendor questionnaires or security documentation requests, contact security@opsvantagedigital.online or see
            the <Link href="/legal" className="font-semibold text-cyan-700 dark:text-cyan-300"> Legal Center</Link>.
          </p>
        </div>
      </section>
    </div>
  );
}