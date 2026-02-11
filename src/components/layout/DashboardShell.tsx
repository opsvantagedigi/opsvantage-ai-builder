"use client";

import { DashboardHeader } from "@/components/layout/DashboardHeader";

type DashboardShellProps = {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
};

export function DashboardShell({ children, title, description, actions, className }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <DashboardHeader />
      <main className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-10">
        {(title || description || actions) && (
          <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
            <div>
              {title && <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{title}</h1>}
              {description && <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>}
            </div>
            {actions && <div className="flex items-center gap-3">{actions}</div>}
          </div>
        )}

        <div className={className}>{children}</div>
      </main>
    </div>
  );
}
