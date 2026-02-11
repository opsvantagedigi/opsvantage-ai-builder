"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(payload.error || "Registration failed.");
        setIsSubmitting(false);
        return;
      }

      router.push("/login");
    } catch {
      setError("Registration failed. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mesh-gradient py-10 md:py-14">
      <section className="section-shell">
        <div className="mx-auto max-w-lg surface-glass p-8 md:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700 dark:text-cyan-300">Create Account</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Set up your OpsVantage workspace</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Create your account to launch AI-driven website operations and access dashboard controls.
          </p>

          <form onSubmit={handleRegister} className="mt-8 space-y-4">
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
                minLength={8}
                placeholder="Use at least 8 characters"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-cyan-900/50"
              />
            </div>

            {error && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-300">
                {error}
              </p>
            )}

            <button type="submit" disabled={isSubmitting} className="button-primary w-full disabled:cursor-not-allowed disabled:opacity-70">
              {isSubmitting ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-600 dark:text-slate-300">
            Already have an account? <Link href="/login" className="font-semibold text-cyan-700 dark:text-cyan-300">Sign in</Link>.
          </p>
        </div>
      </section>
    </div>
  );
}