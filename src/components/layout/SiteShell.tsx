"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { Footer } from "@/components/layout/Footer";

const HIDDEN_PREFIXES = ["/dashboard", "/admin", "/studio", "/generate", "/sites"];

function shouldHideChrome(pathname: string) {
  if (HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return true;
  }

  // Workspace settings route: /{workspaceId}/settings
  if (/^\/[^/]+\/settings$/.test(pathname)) {
    return true;
  }

  return false;
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const hideChrome = useMemo(() => shouldHideChrome(pathname), [pathname]);

  if (hideChrome) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <PublicHeader />
      <div className="flex min-h-[calc(100vh-4rem)] flex-col">
        <div className="flex-1">{children}</div>
        <Footer />
      </div>
    </div>
  );
}
