'use client';

import useSWR from 'swr';
import Link from 'next/link';

// Define the shape of the workspace data returned by our API
interface Workspace {
  id: string;
  name: string;
  slug: string;
  _count: {
    members: number;
    projects: number;
  };
}

// A simple fetcher function for useSWR that expects a JSON response
const fetcher = (url: string) => fetch(url).then((res) => res.json());

/**
 * A component to fetch and display a list of the current user's workspaces.
 */
export function WorkspaceList() {
  const { data: workspaces, error, isLoading } = useSWR<Workspace[]>('/api/workspaces', fetcher);

  if (isLoading) {
    return (
      <div className="p-6 border rounded-lg max-w-2xl mx-auto my-10">
        <h2 className="text-xl font-semibold mb-4">Your Workspaces</h2>
        <div className="space-y-4">
          {/* Skeleton loader */}
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 border rounded-md bg-gray-50 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 border rounded-lg max-w-2xl mx-auto my-10 bg-red-50 text-red-700">
        <h2 className="text-xl font-semibold mb-2">Error Loading Workspaces</h2>
        <p>Could not fetch your workspaces. Please try again later.</p>
      </div>
    );
  }

  if (!workspaces || workspaces.length === 0) {
    return (
      <div className="p-6 border rounded-lg max-w-2xl mx-auto my-10 text-center">
        <h2 className="text-xl font-semibold mb-2">No Workspaces Found</h2>
        <p className="text-gray-600">Create a new workspace to get started.</p>
      </div>
    );
  }

  return (
    <div className="p-6 border rounded-lg max-w-2xl mx-auto my-10 bg-white shadow">
      <h2 className="text-xl font-semibold mb-4">Your Workspaces</h2>
      <ul className="space-y-3">
        {workspaces.map((workspace) => (
          <li key={workspace.id}>
            <Link href={`/dashboard/${workspace.slug}`} className="block p-4 border rounded-md hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-800">{workspace.name}</span>
                <div className="text-sm text-gray-500 space-x-4">
                  <span>{workspace._count.members} Member(s)</span>
                  <span>{workspace._count.projects} Project(s)</span>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}