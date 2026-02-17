import Link from "next/link";

export default async function SovereignAccessPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const showError = params.error === "invalid";

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-md items-center px-6">
        <div className="w-full rounded-2xl border border-amber-500/20 bg-slate-900/80 p-8 shadow-2xl shadow-amber-900/10">
          <p className="text-xs uppercase tracking-[0.18em] text-amber-300/80">Sovereign Gateway</p>
          <h1 className="mt-3 text-3xl font-semibold text-amber-200">Command Center Access</h1>
          <p className="mt-2 text-sm text-slate-400">Authenticate with your master key to unlock Sovereign controls.</p>

          <form method="post" action="/sovereign-access/submit" className="mt-8 space-y-4">
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              className="sr-only"
              tabIndex={-1}
              aria-hidden="true"
              defaultValue="sovereign"
            />
            <label className="block text-sm text-slate-300" htmlFor="password">
              Master Key
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className="w-full rounded-xl border border-amber-400/30 bg-slate-950 px-4 py-3 text-slate-100 outline-none ring-0 transition focus:border-amber-300"
              placeholder="Enter your sovereign key"
            />

            {showError && (
              <p className="text-sm text-red-300">Invalid master key. Try again.</p>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-105"
            >
              Enter Neural Dashboard
            </button>
          </form>

          <div className="mt-6 border-t border-slate-800 pt-4">
            <Link href="/" className="text-sm text-slate-400 transition hover:text-amber-300">
              Return to launch page
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
