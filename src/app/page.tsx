import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CheckCircle2, Cpu, Gauge, ShieldCheck, Sparkles } from 'lucide-react';

import { AuthGuardedCta } from '@/components/auth/AuthGuardedCta';
import IntakeForm from '@/components/marketing/IntakeForm';
import NexusCountdown from '@/components/marketing/NexusCountdown';
import { SovereignTicker } from '@/components/marketing/SovereignTicker';
import { WaitlistViralCard } from '@/components/marketing/WaitlistViralCard';
import { getDynamicHeroContent, type HeroContent } from '@/lib/marketing/hero-cycle';

export const revalidate = 3600;

const heroSignals = [
  '48-hour narrative rotation',
  'GPU-grade neural core handshake',
  'Sovereign 25 scarcity automation',
];

const proofCards = [
  {
    title: 'SaaS Sovereignty Blueprint',
    summary: 'Full launch architecture with conversion flow, copy structure, and orchestration checkpoints.',
    metric: '12 sections',
    badge: 'Generated in 24h',
  },
  {
    title: 'Enterprise Services Stack',
    summary: 'Compliance-ready funnel with trust markers, SLA proof, and governance rails.',
    metric: '9 sections',
    badge: 'Ops-ready',
  },
  {
    title: 'Founder Sprint Kit',
    summary: 'Waitlist, referral engine, and MARZ activation sequence stitched into one flow.',
    metric: '48h cycle',
    badge: 'FOMO aligned',
  },
];

const capabilityHighlights = [
  {
    icon: Cpu,
    title: 'AI Architecture',
    description: 'Structured briefs, conversion maps, and ready-to-build component plans.',
  },
  {
    icon: ShieldCheck,
    title: 'Enterprise Controls',
    description: 'Role-based governance, audit trails, and secure deployment guardrails.',
  },
  {
    icon: Gauge,
    title: 'Operational Analytics',
    description: 'Performance signals, delivery velocity, and on-demand optimization loops.',
  },
];

export default async function Page() {
  const hero = await getDynamicHeroContent();
  return <FullLanding hero={hero} />;
}

function FullLanding({ hero }: { hero: HeroContent }) {
  const heroVideoUrl = (process.env.NEXT_PUBLIC_MARZ_HERO_VIDEO_URL || '').trim();
  const primaryCtaHref = hero.ctaHref
    ? hero.ctaHref.startsWith('#')
      ? `/${hero.ctaHref}`
      : hero.ctaHref
    : '/#waitlist';

  return (
    <div className="mesh-gradient">
      <section className="hero-shell pt-10 pb-12">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700 dark:border-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-300">
              <Sparkles className="h-3.5 w-3.5" />
              Titan Hero Engine {hero.phase ? `• ${hero.phase}` : ''}
            </div>

            <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-tight text-slate-900 md:text-6xl dark:text-slate-100">
              {hero.headline}
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 md:text-lg dark:text-slate-300">
              {hero.subheader}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <AuthGuardedCta label={hero.ctaLabel} href={primaryCtaHref} className="button-primary cta-zenith">
                {hero.ctaLabel}
                <ArrowRight className="ml-2 h-4 w-4" />
              </AuthGuardedCta>
              <Link href="#promotions" className="button-secondary cta-zenith">
                Explore the Launch
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              {heroSignals.map((signal) => (
                <span key={signal} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 dark:border-slate-700">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  {signal}
                </span>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-950/80 p-4 shadow-[0_0_35px_rgba(14,116,144,0.25)] dark:border-slate-800">
            <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-cyan-500/20 blur-3xl" />
            <div className="absolute -bottom-12 -right-12 h-40 w-40 rounded-full bg-amber-500/20 blur-3xl" />
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40">
              {heroVideoUrl ? (
                <video
                  src={heroVideoUrl}
                  poster="/MARZ_Headshot.png"
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="h-full w-full object-cover"
                />
              ) : (
                <Image
                  src="/MARZ_Headshot.png"
                  alt="MARZ presence"
                  width={900}
                  height={1200}
                  className="h-full w-full object-cover"
                  priority
                />
              )}
            </div>
            <div className="mt-4 rounded-xl border border-amber-400/30 bg-slate-950/80 px-4 py-3 text-sm text-amber-200">
              MARZ is online. Your next launch is listening.
            </div>
          </div>
        </div>
      </section>

      <section id="promotions" className="section-shell py-10">
        <div className="grid gap-6 lg:grid-cols-3">
          <div id="waitlist" className="lg:col-span-2">
            <WaitlistViralCard />
          </div>
          <div className="flex flex-col gap-6">
            <SovereignTicker />
            <div className="surface-card border border-slate-200/60 bg-white/80 p-6 dark:border-slate-800/80 dark:bg-slate-950/40">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Queue Jump Protocol</p>
              <p className="mt-3 text-sm leading-6 text-slate-700 dark:text-slate-200">
                Spin the Neural Wheel once. Rewards persist to your session and accelerate your spot in line.
              </p>
              <div className="mt-4 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700 dark:border-cyan-900/60 dark:bg-cyan-950/40 dark:text-cyan-200">
                Queue Jump: +100 positions
              </div>
            </div>
            <div className="surface-card border border-slate-200/60 bg-white/80 p-6 dark:border-slate-800/80 dark:bg-slate-950/40">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Launch Timer</p>
              <NexusCountdown />
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell py-10">
        <div className="surface-card p-8 md:p-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-300">Feature Proof</p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-900 md:text-3xl dark:text-slate-100">Live MARZ-generated launch systems</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                Each blueprint shows the narrative structure, conversion flow, and operational backbone MARZ assembles for launch teams.
              </p>
            </div>
            <Link href="/showcase" className="button-secondary cta-zenith">
              View Showcase
            </Link>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {proofCards.map((card) => (
              <article key={card.title} className="rounded-2xl border border-slate-200 bg-white/80 p-5 dark:border-slate-800 dark:bg-slate-950/40">
                <div className="h-28 rounded-xl bg-gradient-to-br from-cyan-100 via-slate-50 to-amber-100 dark:from-cyan-900/40 dark:via-slate-950 dark:to-amber-900/30" />
                <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">{card.title}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{card.summary}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  <span className="rounded-full border border-slate-200 px-3 py-1 dark:border-slate-700">{card.metric}</span>
                  <span className="rounded-full border border-amber-200 px-3 py-1 text-amber-700 dark:border-amber-900/60 dark:text-amber-200">
                    {card.badge}
                  </span>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {capabilityHighlights.map((capability) => {
              const Icon = capability.icon;
              return (
                <div key={capability.title} className="rounded-2xl border border-slate-200 bg-white/70 p-5 dark:border-slate-800 dark:bg-slate-950/30">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-cyan-300">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">{capability.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{capability.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="legacy" className="section-shell py-10 pb-16">
        <div className="surface-glass flex flex-col gap-8 p-8 md:flex-row md:items-center md:justify-between md:p-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-300">Waitlist Gate</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-900 md:text-3xl dark:text-slate-100">Join the legacy before MARZ awakens.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              Secure a Sovereign 25 slot or schedule a launch consultation to enter the Titan program.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="#waitlist" className="button-primary cta-zenith">
                Join the Sovereign 25
              </Link>
              <Link href="/concierge/spec-intake" className="button-secondary cta-zenith">
                Book a Consultation
              </Link>
            </div>
          </div>
          <div className="w-full max-w-md">
            <IntakeForm />
          </div>
        </div>
      </section>
    </div>
  );
}
