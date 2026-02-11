'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="mesh-gradient flex min-h-screen items-center justify-center px-4 py-10">
          <div className="surface-glass w-full max-w-lg p-8 text-center">
            <h2 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Critical Error</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              The application encountered a critical rendering issue.
            </p>
            {error?.digest && (
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Error ID: {error.digest}</p>
            )}

            <div className="mt-6">
              <button type="button" onClick={() => reset()} className="button-primary !px-5 !py-2">
                Reload Application
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}