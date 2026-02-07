'use client';

import { useState } from 'react';
import { addCustomDomainAction } from '@/app/actions/project-actions';
import { Loader2 } from 'lucide-react';

interface CustomDomainFormProps {
  projectId: string;
}

export function CustomDomainForm({ projectId }: CustomDomainFormProps) {
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const response = await addCustomDomainAction(projectId, domain);

    if (response.error) {
      setError(response.error);
    } else {
      setResult(response);
    }

    setLoading(false);
  };

  return (
    <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-xl">
      <h3 className="text-lg font-semibold text-white mb-4">Add a Custom Domain</h3>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="example.com"
          className="w-full px-3 py-2 border border-slate-700 rounded-md bg-slate-950 text-white h-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="h-12 px-6 bg-blue-600 hover:bg-blue-500 text-white rounded-md disabled:bg-gray-500 flex items-center justify-center"
        >
          {loading ? <Loader2 className="animate-spin" /> : 'Add'}
        </button>
      </form>

      {error && <p className="mt-4 text-red-400">{error}</p>}

      {result?.success && (
        <div className="mt-6 p-4 rounded-lg border border-slate-700 bg-slate-950">
          <p className="text-green-400 mb-4">{result.message}</p>
          <h4 className="font-semibold text-white mb-2">Required DNS Configuration</h4>
          <p className="text-sm text-slate-400 mb-4">
            To verify your domain, add the following records with your DNS provider.
          </p>
          <div className="space-y-3 text-sm font-mono">
            {result.configuration.map((record: any, index: number) => (
              <div key={index} className="p-3 bg-slate-800 rounded-md">
                <div className="flex justify-between">
                  <span className="text-slate-400">Type:</span>
                  <span className="text-white">{record.type}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-slate-400">Name:</span>
                  <span className="text-white">{record.domain.split('.')[0]}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-slate-400">Value:</span>
                  <span className="text-white break-all">{record.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}