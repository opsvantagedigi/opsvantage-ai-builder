"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { MARKETING_NAV, SITE_DOMAIN } from "@/lib/site-config";

export function PublicHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        <Link href="/" className="group inline-flex items-center gap-3" onClick={() => setMenuOpen(false)}>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold tracking-wide text-white shadow-sm dark:bg-cyan-400 dark:text-slate-950">
            OV
          </span>
          <span className="text-sm font-semibold tracking-wide text-slate-900 dark:text-slate-100">
            OpsVantage Digital
            <span className="ml-2 hidden text-xs font-medium text-slate-500 md:inline dark:text-slate-400">
              {SITE_DOMAIN}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {MARKETING_NAV.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition ${
                  isActive
                    ? "text-cyan-600 dark:text-cyan-400"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <Link
            href="/onboarding"
            className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
          >
            Start Free
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 md:hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          aria-label="Toggle navigation"
        >
          {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden dark:border-slate-800 dark:bg-slate-950">
          <nav className="flex flex-col gap-3">
            {MARKETING_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-2 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 flex items-center justify-between">
              <ThemeToggle />
              <Link
                href="/onboarding"
                onClick={() => setMenuOpen(false)}
                className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white dark:bg-cyan-500 dark:text-slate-950"
              >
                Start Free
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}