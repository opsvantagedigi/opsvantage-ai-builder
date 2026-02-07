'use client';

import useSWR, { useSWRConfig } from 'swr';
import { AgencyClientStatus, Workspace } from '@prisma/client';
import Link from 'next/link';
import { useState } from 'react';

interface ClientListProps {
  workspaceId: string;
}

type ClientRelation = {
  id: string;
  status: AgencyClientStatus;
  client: Pick<Workspace, 'id' | 'name' | 'slug'>;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

/**
 * A component to display pending and active client relationships for an agency.
 */
export function ClientList({ workspaceId }: ClientListProps) {
  const { mutate } = useSWRConfig();
  const [actionError, setActionError] = useState<string | null>(null);
  const apiUrl = `/api/workspaces/${workspaceId}/clients`;

  const {
    data: relations,
    error,
    isLoading,
  } = useSWR<ClientRelation[]>(apiUrl, fetcher);

  const handleRevoke = async (relationId: string) => {
    setActionError(null);
    if (!confirm('Are you sure you want to revoke this invitation?')) return;

    try {
      const res = await fetch(`${apiUrl}/${relationId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to revoke invitation.');
      }

      // Re-fetch the client list
      mutate(apiUrl);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setActionError(err.message);
      } else {
        setActionError('An unknown error occurred.');
      }
    }
  };

  if (isLoading) {
    return <div className="p-4 text-center">Loading clients...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Failed to load clients: {error.message}</div>;
  }

  const pending = relations?.filter((r) => r.status === 'PENDING') ?? [];
  const accepted = relations?.filter((r) => r.status === 'ACCEPTED') ?? [];

  return (
    <div className="space-y-8 max-w-2xl mx-auto my-10">
      {actionError && <p className="text-sm text-red-600">Error: {actionError}</p>}
      {/* Accepted Clients List */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Managed Clients</h3>
        <div className="divide-y divide-gray-200 rounded-md border bg-white shadow-sm">
          {accepted.length > 0 ? (
            accepted.map((relation) => (
              <div key={relation.id} className="flex items-center justify-between p-4">
                <Link href={`/dashboard/${relation.client.slug}`} className="font-medium text-blue-600 hover:underline">
                  {relation.client.name}
                </Link>
                <span className="text-sm px-2 py-1 bg-green-100 text-green-800 rounded-full">
                  Active
                </span>
              </div>
            ))
          ) : (
            <p className="p-4 text-gray-500">No active clients.</p>
          )}
        </div>
      </div>

      {/* Pending Invitations List */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Pending Invitations</h3>
        <div className="divide-y divide-gray-200 rounded-md border bg-white shadow-sm">
          {pending.length > 0 ? (
            pending.map((relation) => (
              <div key={relation.id} className="flex items-center justify-between p-4">
                <span className="font-medium text-gray-700">{relation.client.name}</span>
                <div className="flex items-center gap-4">
                  <span className="text-sm px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                    Pending
                  </span>
                  <button
                    onClick={() => handleRevoke(relation.id)}
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    Revoke
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="p-4 text-gray-500">No pending invitations.</p>
          )}
        </div>
      </div>
    </div>
  );
}