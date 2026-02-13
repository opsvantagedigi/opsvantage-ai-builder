import Link from "next/link";
import Image from "next/image";
import { LEGAL_LINKS, PRODUCT_LINKS, RESOURCE_LINKS, SITE_DOMAIN, TOOL_LINKS } from "@/lib/site-config";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 md:grid-cols-4 md:px-6">
        <div className="space-y-4 md:col-span-1">
          <Link href="/" className="group flex items-center gap-4">
            <Image
              src="/icon.png"
              alt="Brand Icon"
              width={33}
              height={33}
              className="h-[33px] w-[33px] aspect-square hover:opacity-80 transition-all duration-300"
            />
            <Image
              src="/logo.svg"
              alt="Brand Logo"
              width={153}
              height={30}
              className="h-[30px] w-auto hover:opacity-80 transition-all duration-300"
            />
          </Link>
          <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
            Autonomous AI website operations for founders, teams, and agencies. Build, launch, host, secure, and optimize
            from one operating system.
          </p>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{SITE_DOMAIN}</p>
        </div>

        <FooterColumn title="Platform" links={PRODUCT_LINKS} />
        <FooterColumn title="Resources" links={RESOURCE_LINKS} />
        <FooterColumn title="Tools" links={TOOL_LINKS} />
      </div>

      <div className="border-t border-slate-200 dark:border-slate-800">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-6 text-xs text-slate-500 md:flex-row md:items-center md:justify-between md:px-6 dark:text-slate-400">
          <p>© {year} All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4">
            {LEGAL_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="transition hover:text-slate-900 dark:hover:text-slate-100">
                {link.label}
              </Link>
            ))}
            <Link
              href="/security"
              className="inline-flex items-center rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-950/70"
            >
              ISO 27001 Aligned
            </Link>
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
