import Link from "next/link";
import { PRODUCT_LINKS, RESOURCE_LINKS, TOOL_LINKS } from "@/lib/site-config";

const legalLinks = [
  { href: "/docs", label: "Documentation" },
  { href: "/pricing", label: "Pricing" },
  { href: "/enterprise", label: "Enterprise" },
  { href: "/onboarding", label: "Launch a Project" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 md:grid-cols-4 md:px-6">
        <div className="space-y-4 md:col-span-1">
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold tracking-wide text-white dark:bg-cyan-400 dark:text-slate-950">
              OV
            </span>
            <span className="text-sm font-semibold tracking-wide text-slate-900 dark:text-slate-100">
              OpsVantage Digital
            </span>
          </Link>
          <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
            Autonomous AI website operations for founders, teams, and agencies. Build, launch, host, secure, and optimize
            from one operating system.
          </p>
        </div>

        <FooterColumn title="Platform" links={PRODUCT_LINKS} />
        <FooterColumn title="Resources" links={RESOURCE_LINKS} />
        <FooterColumn title="Tools" links={TOOL_LINKS} />
      </div>

      <div className="border-t border-slate-200 dark:border-slate-800">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-6 text-xs text-slate-500 md:flex-row md:items-center md:justify-between md:px-6 dark:text-slate-400">
          <p>© {year} OpsVantage Digital Pty Ltd. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4">
            {legalLinks.map((link) => (
              <Link key={link.href} href={link.href} className="transition hover:text-slate-900 dark:hover:text-slate-100">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: Array<{ href: string; label: string }> }) {
  return (
    <div>
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">{title}</h3>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-sm text-slate-700 transition hover:text-slate-950 dark:text-slate-200 dark:hover:text-white">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
