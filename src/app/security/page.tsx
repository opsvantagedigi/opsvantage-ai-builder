import Link from "next/link";
import { ShieldCheck } from "lucide-react";

const controls = [
  {
    domain: "Access Control",
    implementation: "Role-based workspace access, session validation, and restricted admin surfaces.",
    mapping: "ISO 27001 A.5, SOC 2 CC6, NIST AC",
    status: "Implemented",
  },
  {
    domain: "Data Protection",
    implementation: "TLS in transit, managed database access, scoped environment variables, and backup strategy.",
    mapping: "ISO 27001 A.8, SOC 2 CC6/CC8, NIST SC",
    status: "Implemented",
  },
  {
    domain: "Logging & Monitoring",
    implementation: "Audit logs for workspace actions, operational health endpoints, and deployment checks.",
    mapping: "ISO 27001 A.12, SOC 2 CC7, NIST AU",
    status: "Implemented",
  },
  {
    domain: "Change Management",
    implementation: "Version-controlled releases, build validation, and controlled production deploy workflows.",
    mapping: "ISO 27001 A.8/A.12, SOC 2 CC8, NIST CM",
    status: "Documented",
  },
  {
    domain: "Incident Response",
    implementation: "Defined escalation paths, security contact channel, and post-incident review process.",
    mapping: "ISO 27001 A.5/A.6, SOC 2 CC7, NIST IR",
    status: "Documented",
  },
  {
    domain: "Vendor Governance",
    implementation: "Subprocessor and third-party service risk review during architecture and procurement updates.",
    mapping: "ISO 27001 A.5, SOC 2 CC9, NIST SR",
    status: "Roadmap",
  },
];

export default function SecurityPage() {
  return (
    <div className="mesh-gradient py-10 md:py-14">
      <section className="section-shell">
        <div className="surface-glass p-8 md:p-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700 dark:border-cyan-900/60 dark:bg-cyan-950/40 dark:text-cyan-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            Security Overview
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl dark:text-slate-100">
            Platform Security and Compliance Mapping
          </h1>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">
            OpsVantage is built with security-first operating practices for website infrastructure and AI-enabled delivery
            workflows. The table below maps current controls to common enterprise frameworks.
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">
            This page is informational and does not represent certification status. For contractual security questionnaires,
            contact security@opsvantagedigital.online.
          </p>
        </div>
      </section>

      <section className="section-shell py-8">
        <article className="surface-card overflow-x-auto p-0">
          <table className="min-w-full divide-y divide-slate-200 text-left dark:divide-slate-800">
            <thead className="bg-slate-100/80 dark:bg-slate-900">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600 dark:text-slate-300">Control Domain</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600 dark:text-slate-300">OpsVantage Control</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600 dark:text-slate-300">Framework Mapping</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600 dark:text-slate-300">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {controls.map((control) => (
                <tr key={control.domain}>
                  <td className="px-4 py-4 text-sm font-semibold text-slate-900 dark:text-slate-100">{control.domain}</td>
                  <td className="px-4 py-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{control.implementation}</td>
                  <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300">{control.mapping}</td>
                  <td className="px-4 py-4 text-sm">
                    <span className="inline-flex rounded-full border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">
                      {control.status}
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
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Security Contact and Reports</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            To request due diligence documentation, report a vulnerability, or submit procurement requirements, contact
            security@opsvantagedigital.online. Policy references are also available in the <Link href="/legal" className="font-semibold text-cyan-700 dark:text-cyan-300">Legal Center</Link>.
          </p>
        </div>
      </section>
    </div>
  );
}