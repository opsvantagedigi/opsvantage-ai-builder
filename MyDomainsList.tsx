'use client';

import { useEffect, useState } from 'react';
import { getRegisteredDomainsAction } from './user-actions';
import { Globe } from 'lucide-react';

interface RegisteredDomain {
  productId: string;
  createdAt: Date;
}

export function MyDomainsList() {
  const [domains, setDomains] = useState<RegisteredDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDomains() {
      const result = await getRegisteredDomainsAction();
      if (result.error) {
        setError(result.error);
      } else if (result.domains) {
        setDomains(result.domains);
      }
      setLoading(false);
    }

    void fetchDomains();
  }, []);

  return (
    <section className="surface-card">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Registered Domains</h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Track domain purchases and registration dates for your account.</p>

      {loading && <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">Loading domains...</p>}
      {error && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      )}

      {!loading && !error && (
        <div className="mt-4 space-y-3">
          {domains.length > 0 ? (
            domains.map((domain) => (
              <div
                key={domain.productId}
                className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 md:flex-row md:items-center md:justify-between"
              >
                <div className="inline-flex items-center gap-2">
                  <Globe className="h-4 w-4 text-cyan-700 dark:text-cyan-300" />
                  <span className="font-medium text-slate-900 dark:text-slate-100">{domain.productId}</span>
                </div>
                <span className="text-xs text-slate-600 dark:text-slate-300">
                  Registered on {new Date(domain.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-600 dark:text-slate-300">No registered domains found for this account yet.</p>
          )}
        </div>
      )}
    </section>
  );
}