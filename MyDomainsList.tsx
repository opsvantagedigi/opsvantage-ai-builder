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
    fetchDomains();
  }, []);

  return (
    <div className="p-8 bg-slate-900/50 border border-slate-800 rounded-2xl mt-12 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6">My Registered Domains</h2>
      {loading && <p className="text-slate-400">Loading your domains...</p>}
      {error && <p className="text-red-400">Error: {error}</p>}
      {!loading && !error && (
        <div className="space-y-4">
          {domains.length > 0 ? (
            domains.map((domain) => (
              <div key={domain.productId} className="flex justify-between items-center p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="flex items-center gap-3">
                  <Globe className="text-cyan-400" size={20} />
                  <span className="font-mono text-lg text-white">{domain.productId}</span>
                </div>
                <span className="text-sm text-slate-400">Registered on: {new Date(domain.createdAt).toLocaleDateString()}</span>
              </div>
            ))
          ) : <p className="text-slate-500 text-center py-4">You haven&apos;t registered any domains yet.</p>}
        </div>
      )}
    </div>
  );
}