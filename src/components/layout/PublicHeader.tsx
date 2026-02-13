"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { AuthGuardedCta } from "@/components/auth/AuthGuardedCta";
import { MARKETING_NAV, SITE_DOMAIN } from "@/lib/site-config";

export function PublicHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        <Link href="/" className="group flex items-center gap-4" onClick={() => setMenuOpen(false)}>
          <Image src="/icon.png" alt="OpsVantage Icon" width={44} height={44} className="h-11 w-11 aspect-square hover:opacity-80 transition-all duration-300" priority />
          <Image src="/logo.svg" alt="OpsVantage Digital" width={204} height={40} className="h-10 w-auto hover:opacity-80 transition-all duration-300" priority />
          <span className="hidden text-xs font-medium text-slate-500 md:inline dark:text-slate-400">{SITE_DOMAIN}</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex relative">
          {MARKETING_NAV.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

            // Special handling for the Services link to show submenu
            if (item.label === "Services") {
              return (
                <div key={item.href} className="relative group">
                  <Link
                    href={item.href}
                    className={`text-sm font-medium transition ${
                      isActive
                        ? "text-cyan-600 dark:text-cyan-400"
                        : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
                    }`}
                  >
                    {item.label} <span className="text-xs">▼</span>
                  </Link>

                  {/* Services submenu */}
                  <div className="absolute top-full left-0 mt-2 w-56 rounded-xl bg-white/90 backdrop-blur-md shadow-lg border border-slate-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 dark:bg-slate-800/90 dark:border-slate-700">
                    <Link
                      href="/services/domains"
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      Domain Registration
                    </Link>
                    <Link
                      href="/services/ssl"
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      SSL Certificates
                    </Link>
                    <Link
                      href="/services/licenses"
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      Hosting Licenses
                    </Link>
                    <Link
                      href="/services/security"
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      Spam Filters
                    </Link>
                  </div>
                </div>
              );
            }

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
          <AuthGuardedCta
            label="Book a Consultation"
            href="/concierge/spec-intake"
            className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
          />
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
            {MARKETING_NAV.map((item) => {
              // Special handling for the Services link to show submenu on mobile
              if (item.label === "Services") {
                return (
                  <div key={item.href} className="w-full">
                    <Link
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className="rounded-lg px-2 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900 block"
                    >
                      {item.label}
                    </Link>

                    {/* Mobile Services submenu */}
                    <div className="pl-4 mt-1 space-y-1">
                      <Link
                        href="/services/domains"
                        onClick={() => setMenuOpen(false)}
                        className="block px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700/50 rounded"
                      >
                        Domain Registration
                      </Link>
                      <Link
                        href="/services/ssl"
                        onClick={() => setMenuOpen(false)}
                        className="block px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700/50 rounded"
                      >
                        SSL Certificates
                      </Link>
                      <Link
                        href="/services/licenses"
                        onClick={() => setMenuOpen(false)}
                        className="block px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700/50 rounded"
                      >
                        Hosting Licenses
                      </Link>
                      <Link
                        href="/services/security"
                        onClick={() => setMenuOpen(false)}
                        className="block px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700/50 rounded"
                      >
                        Spam Filters
                      </Link>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-2 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="mt-2 flex items-center justify-between">
              <ThemeToggle />
              <AuthGuardedCta
                label="Book a Consultation"
                href="/concierge/spec-intake"
                className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white dark:bg-cyan-500 dark:text-slate-950"
              />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}