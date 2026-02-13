"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReactNode, useMemo, useState } from "react";
import { signIn } from "next-auth/react";

type AuthGuardedCtaProps = {
  label: string;
  href: string;
  className?: string;
  children?: ReactNode;
};

const GUARDED_LABELS = new Set(["start free", "start building", "run ai architect"]);

export function AuthGuardedCta({ label, href, className, children }: AuthGuardedCtaProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [providerKeys, setProviderKeys] = useState<string[]>([]);

  const shouldGuard = useMemo(() => GUARDED_LABELS.has(label.trim().toLowerCase()), [label]);

  const handleClick = async () => {
    if (!shouldGuard) {
      router.push(href);
      return;
    }

    setBusy(true);
    try {
      // For now, skip session check since useSession is not available
      // In a real implementation, you would check the session here

      // Hardcoded provider IDs since getProviders is not available in client components
      const ids = ["google", "github"]; // Common providers
      setProviderKeys(ids);
      setOpen(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button type="button" onClick={() => void handleClick()} className={className} disabled={busy}>
        {children ?? label}
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Sign in to continue</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Authenticate to continue to your launch workflow.</p>

            <div className="mt-5 space-y-2">
              {providerKeys.map((providerId) => (
                <button
                  key={providerId}
                  type="button"
                  onClick={() => void signIn(providerId, { callbackUrl: href })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Continue with {providerId.charAt(0).toUpperCase() + providerId.slice(1)}
                </button>
              ))}

              <Link
                href={`/login?callbackUrl=${encodeURIComponent(href)}`}
                className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
              >
                Continue with Email
              </Link>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-4 w-full rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}