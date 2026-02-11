"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [providers, setProviders] = useState<Record<string, unknown> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const result = await signIn("credentials", {
      email,
      password,
      callbackUrl: "/dashboard",
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid credentials. Please verify your email and password.");
      setIsSubmitting(false);
      return;
    }

    window.location.href = result?.url || "/dashboard";
  }

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const response = await fetch("/api/auth/providers");
        const data = (await response.json()) as Record<string, unknown>;
        if (mounted) {
          setProviders(data);
        }
      } catch {
        // Ignore provider load failures and keep credential login available.
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="mesh-gradient py-10 md:py-14">
      <section className="section-shell">
        <div className="mx-auto max-w-lg surface-glass p-8 md:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700 dark:text-cyan-300">Account Access</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Sign in to your dashboard</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Continue managing projects, billing, and launch workflows from your OpsVantage workspace.
          </p>

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                placeholder="you@company.com"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-cyan-900/50"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                placeholder="Enter your password"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-cyan-900/50"
              />
            </div>

            {error && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-300">
                {error}
              </p>
            )}

            <button type="submit" disabled={isSubmitting} className="button-primary w-full disabled:cursor-not-allowed disabled:opacity-70">
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            <div className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">or continue with</div>
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          </div>

          <div className="space-y-2">
            {providers &&
              Object.keys(providers)
                .filter((key) => key !== "credentials")
                .map((key) => {
                  const provider = providers[key] as Record<string, unknown>;
                  const providerId = String(provider.id || key);
                  const providerName = String(provider.name || key);

                  return (
                    <button
                      key={providerId}
                      type="button"
                      onClick={() => signIn(providerId, { callbackUrl: "/dashboard" })}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      {providerId === "google" ? (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18" height="18" aria-hidden="true">
                            <path fill="#EA4335" d="M24 9.5c3.9 0 6.8 1.6 8.5 2.9l6.2-6.1C35 3.1 30.9 1.5 24 1.5 14.6 1.5 6.9 6.9 3.4 14.5l7 5.4C12.6 15 17.7 9.5 24 9.5z" />
                            <path fill="#34A853" d="M46.5 24c0-1.6-.1-2.6-.4-3.8H24v7.2h12.7c-.5 3-2.9 7-8.2 9.2l6.2 4.8C43.5 37.1 46.5 31.1 46.5 24z" />
                            <path fill="#4A90E2" d="M10.4 29.9A14.9 14.9 0 0 1 9.2 24c0-1.2.2-2.3.5-3.4L3 15.2A23.9 23.9 0 0 0 1.5 24c0 3.9 1 7.6 2.9 10.9l6-5z" />
                            <path fill="#FBBC05" d="M24 46.5c6.9 0 12.9-2.3 17.2-6.2l-6.2-4.8c-2 1.4-5.1 2.7-11 2.7-6.3 0-11.4-5.5-12.9-12.6l-7 5.4C6.9 41.1 14.6 46.5 24 46.5z" />
                          </svg>
                          <span>Continue with Google</span>
                        </>
                      ) : (
                        <span>Continue with {providerName}</span>
                      )}
                    </button>
                  );
                })}
          </div>

          <p className="mt-6 text-sm text-slate-600 dark:text-slate-300">
            Need an account? <Link href="/register" className="font-semibold text-cyan-700 dark:text-cyan-300">Create one</Link>.
          </p>
        </div>
      </section>
    </div>
  );
}