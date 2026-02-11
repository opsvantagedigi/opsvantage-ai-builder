'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mesh-gradient flex min-h-screen items-center justify-center px-4 py-10">
      <div className="surface-glass w-full max-w-lg p-8 text-center">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Something went wrong</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
          We encountered an unexpected error while rendering this page.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button type="button" onClick={() => reset()} className="button-primary !px-5 !py-2">
            Try Again
          </button>
          <button type="button" onClick={() => (window.location.href = '/')} className="button-secondary !px-5 !py-2">
            Go Home
          </button>
        </div>

        {error.digest && (
          <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">Error ID: {error.digest}</p>
        )}
      </div>
    </div>
  );
}