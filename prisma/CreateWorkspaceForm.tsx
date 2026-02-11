'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function CreateWorkspaceForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Workspace name cannot be empty.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: name.trim() }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || 'Failed to create workspace.');
      }

      setName('');
      router.refresh();
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : 'Failed to create workspace.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="surface-card">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Create a Workspace</h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        Workspaces separate projects, team permissions, and billing boundaries.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <label htmlFor="workspaceName" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
            Workspace Name
          </label>
          <input
            id="workspaceName"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Acme Growth Team"
            disabled={isLoading}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-cyan-900/50"
          />
        </div>

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="button-primary w-full disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoading ? 'Creating workspace...' : 'Create Workspace'}
        </button>
      </form>
    </section>
  );
}