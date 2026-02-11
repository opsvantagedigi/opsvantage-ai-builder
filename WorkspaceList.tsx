'use client';

import Link from 'next/link';
import useSWR from 'swr';
import { ChevronRight, Users2 } from 'lucide-react';

interface Workspace {
  id: string;
  name: string;
  slug: string;
  _count: {
    members: number;
    projects: number;
  };
}

const fetcher = async (url: string): Promise<Workspace[]> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to load workspaces');
  }
  return response.json() as Promise<Workspace[]>;
};

export function WorkspaceList() {
  const { data: workspaces, error, isLoading } = useSWR<Workspace[]>('/api/workspaces', fetcher);

  if (isLoading) {
    return (
      <section className="surface-card p-0">
        <header className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Your Workspaces</h2>
        </header>
        <div className="space-y-3 p-6">
          {[1, 2, 3].map((item) => (
            <div key={item} className="animate-pulse rounded-xl border border-slate-200 p-4 dark:border-slate-700">
              <div className="h-4 w-40 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="mt-2 h-3 w-28 rounded bg-slate-100 dark:bg-slate-800" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="surface-card border-red-200 dark:border-red-900/70">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Your Workspaces</h2>
        <p className="mt-2 text-sm text-red-700 dark:text-red-300">Unable to load workspaces right now.</p>
      </section>
    );
  }

  if (!workspaces || workspaces.length === 0) {
    return (
      <section className="surface-card">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Your Workspaces</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">No workspaces yet. Create your first workspace below.</p>
      </section>
    );
  }

  return (
    <section className="surface-card p-0">
      <header className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Your Workspaces</h2>
      </header>

      <ul className="space-y-3 p-6">
        {workspaces.map((workspace) => (
          <li key={workspace.id}>
            <Link
              href={`/${workspace.id}/settings`}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 transition hover:border-cyan-400 hover:bg-cyan-50/40 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-cyan-600 dark:hover:bg-cyan-950/20"
            >
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{workspace.name}</p>
                <p className="mt-1 inline-flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <Users2 className="h-3.5 w-3.5" />
                  {workspace._count.members} members · {workspace._count.projects} projects
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}