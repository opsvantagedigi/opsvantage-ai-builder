'use client'

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { checkDomainAvailabilityAction } from '@/app/actions/domain-actions';
import { CheckCircle2, Globe, Loader2, Search, ShieldCheck, XCircle } from 'lucide-react';

type DomainResult = {
  domain: string;
  status: 'free' | 'taken' | string;
  isPremium?: boolean;
  price?: {
    amount: number;
    currency: string;
  };
};

export function DomainSearchInput() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<DomainResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.includes('.')) {
      setError('Enter a full domain including extension (example.com).');
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const data = await checkDomainAvailabilityAction(query.trim().toLowerCase());
      if (data.error) {
        setError(data.error);
        return;
      }

      setResult(data as DomainResult);
    } catch {
      setError('Domain lookup failed. Please retry in a moment.');
    } finally {
      setLoading(false);
    }
  };

  const showAvailable = result?.status === 'free';

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-3 md:flex-row">
          <label htmlFor="domain-search" className="sr-only">
            Domain search
          </label>
          <div className="relative flex-1">
            <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
            <input
              id="domain-search"
              type="text"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                if (error) {
                  setError(null);
                }
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  void handleSearch();
                }
              }}
              placeholder="Search a domain (example.com)"
              className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-cyan-900/50"
            />
          </div>

          <button
            type="button"
            onClick={() => void handleSearch()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Checking
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Check Domain
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      )}

      <AnimatePresence>
        {result && (
          <motion.article
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <span
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border ${
                    showAvailable
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : 'border-red-200 bg-red-50 text-red-600 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-300'
                  }`}
                >
                  {showAvailable ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                </span>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                    {showAvailable ? 'Available' : 'Unavailable'}
                  </p>
                  <h3 className="mt-1 text-xl font-semibold text-slate-900 dark:text-slate-100">{result.domain}</h3>
                  {result.isPremium && (
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-amber-600 dark:text-amber-300">
                      Premium domain
                    </p>
                  )}
                </div>
              </div>

              {showAvailable && result.price && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-950">
                  <p className="text-xs uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Estimated annual price</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {result.price.currency} {result.price.amount}
                  </p>
                </div>
              )}
            </div>
          </motion.article>
        )}
      </AnimatePresence>

      {!result && !loading && (
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-300">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 dark:border-slate-700 dark:bg-slate-900">
            <ShieldCheck className="h-3.5 w-3.5 text-cyan-700 dark:text-cyan-300" />
            ICANN-accredited search path
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 dark:border-slate-700 dark:bg-slate-900">
            <Globe className="h-3.5 w-3.5 text-cyan-700 dark:text-cyan-300" />
            Domain + SSL workflow support
          </span>
        </div>
      )}
    </div>
  );
}