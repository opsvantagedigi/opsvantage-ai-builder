"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useMemo, useState } from "react";
import { ThemeToggle } from "@/components/theme/theme-toggle";

type NavItem = {
  href: string;
  label: string;
};

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = useMemo<NavItem[]>(() => {
    const items: NavItem[] = [
      { href: "/dashboard", label: "Workspace" },
      { href: "/dashboard/billing", label: "Billing" },
      { href: "/onboarding", label: "Launch Wizard" },
    ];

    if (/^\/[^/]+\/settings$/.test(pathname)) {
      items.splice(2, 0, { href: pathname, label: "Settings" });
    }

    return items;
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        <Link href="/dashboard" className="inline-flex items-center gap-3" onClick={() => setMenuOpen(false)}>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold tracking-wide text-white dark:bg-cyan-400 dark:text-slate-950">
            OV
          </span>
          <span className="text-sm font-semibold tracking-wide text-slate-900 dark:text-slate-100">OpsVantage Console</span>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive(pathname, item.href)
                  ? "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-200"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <Link href="/" className="button-secondary !px-4 !py-2">
            View Website
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 md:hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          aria-label="Toggle dashboard menu"
        >
          {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden dark:border-slate-800 dark:bg-slate-950">
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive(pathname, item.href)
                    ? "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-200"
                    : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                }`}
              >
                {item.label}
              </Link>
            ))}

            <div className="mt-2 flex items-center justify-between">
              <ThemeToggle />
              <Link href="/" onClick={() => setMenuOpen(false)} className="button-secondary !px-4 !py-2">
                View Website
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}