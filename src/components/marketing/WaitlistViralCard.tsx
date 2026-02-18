'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { SpinWheel, type WheelPrizeId } from '@/components/marketing/SpinWheel';

type OfferStatus = {
  offerId: string;
  claimed: number;
  limit: number | null;
  remaining: number | null;
  exhausted: boolean;
};

type WaitlistResponse = {
  message: string;
  lead: {
    email: string;
    referralCode: string;
    referralUrl: string | null;
    referralsCount: number;
    wheelPrize: string | null;
    sovereignFounder: boolean;
  };
  position: { base: number; boost: number; estimated: number } | null;
};

function formatPrize(prize: string | null) {
  if (!prize) return 'Mystery reward';
  switch (prize) {
    case 'queue_jump':
      return 'Queue Jump (Move 100 spots up)';
    case 'sovereign_25_discount_code':
      return 'Sovereign 25 Discount Code (Extra 10% Off)';
    case 'free_custom_domain':
      return 'Free Custom Domain (1 Year Credit)';
    case 'zenith_lifetime_pro':
      return 'THE ZENITH (Lifetime Pro Access)';
    default:
      return prize;
  }
}

export function WaitlistViralCard() {
  const searchParams = useSearchParams();
  const ref = (searchParams.get('ref') || '').trim();

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offer, setOffer] = useState<OfferStatus | null>(null);
  const [result, setResult] = useState<WaitlistResponse | null>(null);
  const [showWheel, setShowWheel] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lockedEmail, setLockedEmail] = useState<string | null>(null);

  const spotsLabel = useMemo(() => {
    if (!offer) return 'Loading…';
    if (offer.remaining === null) return 'Live';
    return `${offer.remaining}`;
  }, [offer]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch('/api/claims/status?offerId=sovereign-25', { cache: 'no-store' });
        const json = (await res.json()) as { offers?: Record<string, OfferStatus> };
        const status = json?.offers?.['sovereign-25'] || null;
        if (!cancelled) setOffer(status);
      } catch {
        if (!cancelled) setOffer(null);
      }
    }
    load();
    const id = setInterval(load, 15_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  function unlockWheel() {
    setError(null);
    setResult(null);
    const trimmed = email.trim();
    if (!trimmed) return;
    setLockedEmail(trimmed.toLowerCase());
    setShowWheel(true);
  }

  async function persistSpin(prizeId: WheelPrizeId) {
    setError(null);
    setSubmitting(true);
    setCopied(false);

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, source: 'landing', referralCode: ref || undefined, wheelPrize: prizeId }),
      });

      const json = (await res.json()) as WaitlistResponse | { error?: string };
      if (!res.ok) {
        setError((json as any)?.error || 'Unable to join waitlist.');
        return;
      }

      setResult(json as WaitlistResponse);
      setShowWheel(false);

      try {
        localStorage.setItem('waitlist:lastEmail', (json as WaitlistResponse).lead.email);
        if ((json as WaitlistResponse).lead.wheelPrize) {
          localStorage.setItem(`waitlist:prize:${(json as WaitlistResponse).lead.email}`, String((json as WaitlistResponse).lead.wheelPrize));
        }
      } catch {
        // ignore
      }
    } catch {
      setError('Unable to join waitlist.');
    } finally {
      setSubmitting(false);
    }
  }

  async function copyReferral() {
    const url = result?.lead.referralUrl;
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }

  return (
    <div className="surface-glass p-8 md:p-10">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700 dark:text-cyan-300">Digital Waitlist</p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Spin the Wheel</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
        One Spin. One Legacy. Claim your Founder&apos;s Advantage.
      </p>

      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
        Sovereign 25: the first 25 founders receive a 50% lifetime discount, a Sovereign Founder badge, and direct voice access to MARZ-Prime.
      </p>

      <div className="mt-6 inline-flex animate-pulse items-center gap-2 rounded-xl border border-slate-200 bg-white/60 px-4 py-3 text-sm font-medium text-slate-800 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200">
        <span className="rounded-lg bg-cyan-50 px-2 py-1 text-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-200">{spotsLabel}/25</span>
        <span>FOUNDER&apos;S CIRCLE SPOTS LEFT</span>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-0 focus:border-cyan-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
          type="email"
          autoComplete="email"
        />
        <button
          className="button-primary whitespace-nowrap"
          onClick={unlockWheel}
          disabled={submitting || !email.trim()}
        >
          {submitting ? 'Saving…' : 'Unlock Spin'}
        </button>
      </div>

      {ref ? (
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Referral code applied.</p>
      ) : null}

      {error ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white/60 p-5 text-sm text-slate-800 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold">Your position:</span>
            <span>
              #{result.position?.estimated ?? '—'}
              {typeof result.position?.boost === 'number' && result.position.boost > 0 ? ` (boosted by ${result.position.boost})` : ''}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="font-semibold">Referrals:</span>
            <span>{result.lead.referralsCount}</span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="font-semibold">Your reward:</span>
            <span>{formatPrize(result.lead.wheelPrize)}</span>
          </div>
          {result.lead.sovereignFounder ? (
            <div className="mt-3 inline-flex items-center rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-300">
              Verified Sovereign Founder
            </div>
          ) : null}

          {result.lead.referralsCount >= 3 ? (
            <div className="mt-3 inline-flex items-center rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs font-semibold text-cyan-800 dark:border-cyan-900/70 dark:bg-cyan-950/40 dark:text-cyan-200">
              Milestone: Top 50 (3 referrals)
            </div>
          ) : null}

          {result.lead.referralsCount >= 10 ? (
            <div className="mt-3 inline-flex items-center rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 dark:border-amber-900/70 dark:bg-amber-950/40 dark:text-amber-200">
              Milestone: AI Copywriting Masterclass (10 referrals)
            </div>
          ) : null}

          {result.lead.referralsCount >= 25 ? (
            <div className="mt-3 inline-flex items-center rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-300">
              Milestone: Founder&apos;s Circle Entry (25 referrals)
            </div>
          ) : null}

          {result.lead.referralUrl ? (
            <div className="mt-4">
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Your referral link</div>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="flex-1 truncate rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                  {result.lead.referralUrl}
                </div>
                <button className="button-secondary whitespace-nowrap" onClick={copyReferral}>
                  {copied ? 'Copied' : 'Copy link'}
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Each referral moves you up 10 places. Milestones: 3 referrals = Top 50 • 10 referrals = Masterclass • 25 referrals = Founder&apos;s Circle entry.
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      {showWheel && lockedEmail ? (
        <div className="mt-6">
          <SpinWheel
            disabled={submitting}
            onSpinEndAction={(prizeId) => {
              void persistSpin(prizeId);
            }}
          />

          <div className="mt-4 flex items-center justify-between">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {submitting ? 'Locking reward…' : 'Spin once to reveal your reward.'}
            </div>
            <button className="button-secondary" onClick={() => setShowWheel(false)}>
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
