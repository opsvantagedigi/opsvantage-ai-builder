"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ArrowRight, Mail, ShieldCheck, Sparkles } from "lucide-react";

type CountdownState = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

type ComingSoonProps = {
  launchDate: string;
};

function calculateCountdown(target: number): CountdownState {
  const delta = Math.max(target - Date.now(), 0);
  const days = Math.floor(delta / (1000 * 60 * 60 * 24));
  const hours = Math.floor((delta / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((delta / (1000 * 60)) % 60);
  const seconds = Math.floor((delta / 1000) % 60);
  return { days, hours, minutes, seconds };
}

export default function ComingSoon({ launchDate }: ComingSoonProps) {
  const target = useMemo(() => new Date(launchDate).getTime(), [launchDate]);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<CountdownState>(calculateCountdown(target));

  useEffect(() => {
    const timer = setInterval(() => setCountdown(calculateCountdown(target)), 1000);
    return () => clearInterval(timer);
  }, [target]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) return;

    setStatus("submitting");
    setMessage(null);

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = (await response.json()) as { message?: string; error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Unable to save your request right now.");
      }

      setStatus("success");
      setMessage(data.message || "Request received. We will confirm your seat for launch.");
      setEmail("");
    } catch (error) {
      const err = error as Error;
      setStatus("error");
      setMessage(err.message || "Something went wrong.");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-black text-slate-50">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -left-24 top-10 h-80 w-80 rounded-full bg-cyan-500 blur-3xl opacity-40 animate-pulse" />
        <div className="absolute bottom-10 right-0 h-96 w-96 rounded-full bg-emerald-500 blur-3xl opacity-30 animate-[pulse_10s_ease-in-out_infinite]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.12),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(16,185,129,0.12),transparent_35%),radial-gradient(circle_at_50%_80%,rgba(14,165,233,0.12),transparent_40%)]" />
      </div>

      <main className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-16 md:px-10">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">
            <Sparkles className="h-4 w-4" />
            Private Beta
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
            <span className="rounded-full bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-200">Launch</span>
            <span>March 10, 2026</span>
            <span className="text-slate-500">·</span>
            <span>
              Countdown {countdown.days}d {countdown.hours}h {countdown.minutes}m {countdown.seconds}s
            </span>
          </div>
        </header>

        <section className="mt-14 grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:items-start">
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.22em] text-cyan-300">OpsVantage Digital</p>
              <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-slate-50 md:text-5xl">
                The Future of AI Operations is Near.
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-slate-200/80">
                OpsVantage is currently in private beta. We are initializing the Neural Bridge for a global launch on March 10, 2026.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-cyan-900/20 backdrop-blur">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-100">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-300">Join the waitlist</p>
                  <p className="text-base font-semibold text-slate-50">Secure your spot for the March 10 launch</p>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-base text-white placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                />
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-900/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {status === "submitting" ? "Sending..." : "Notify Me"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
              {status === "success" && (
                <p className="mt-3 text-sm text-emerald-200">
                  {message ?? "Request received. We will confirm your seat for launch."}
                </p>
              )}
              {status === "error" && <p className="mt-3 text-sm text-rose-200">{message ?? "Something went wrong."}</p>}
              <p className="mt-4 text-xs text-slate-400">
                Your email is kept private and used only for launch communications.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-emerald-900/20 backdrop-blur">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.18),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(6,182,212,0.22),transparent_30%)]" />
              <div className="relative space-y-4">
                <div className="flex items-center justify-between text-sm text-slate-200">
                  <span>Neural Bridge Status</span>
                  <span className="text-emerald-300">Initializing…</span>
                </div>
                <div className="relative h-3 overflow-hidden rounded-full bg-slate-800/80">
                  <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-cyan-500 via-emerald-400 to-cyan-500" style={{ width: "86%" }} />
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-emerald-400/10 to-cyan-500/10" />
                </div>
                <p className="text-sm text-slate-300">Secure launch window locked. Systems warming for global availability.</p>
              </div>
            </div>

            <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-slate-900/30 backdrop-blur">
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>Launch Date</span>
                <span className="font-semibold text-white">March 10, 2026</span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>Access</span>
                <span className="font-semibold text-white">Private Beta · Admin Only</span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>Performance Envelope</span>
                <span className="font-semibold text-white">Optimized · 90+ Lighthouse</span>
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-auto flex flex-col gap-3 py-10 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-slate-200">
            <ShieldCheck className="h-4 w-4 text-emerald-300" />
            ISO 27001 Aligned
          </div>
          <div className="text-xs text-slate-500">OpsVantage Digital · Private Beta Access</div>
        </footer>
      </main>
    </div>
  );
}
