
'use client';

import useSWR, { useSWRConfig } from 'swr';
import { useState } from 'react';
import { User, WorkspaceMember, Invitation, Role } from '@prisma/client';
import Image from 'next/image';

interface WorkspaceMembersListProps {
  workspaceId: string;
}

// Remove unused MemberWithUser type

const fetcher = (url: string) => fetch(url).then((res) => res.json());

/**
 * A component to display existing members and pending invitations for a workspace.
 */
export function WorkspaceMembersList({ workspaceId }: WorkspaceMembersListProps) {
  const { mutate } = useSWRConfig();
  const [actionError, setActionError] = useState<string | null>(null);

  const membersApiUrl = `/api/workspaces/${workspaceId}/members`;
  const invitationsApiUrl = `/api/workspaces/${workspaceId}/invitations`;
  const {
    data: members,
    error: membersError,
    isLoading: membersLoading,
  } = useSWR<(WorkspaceMember & { user: Pick<User, 'id' | 'name' | 'email' | 'image'> })[]>(membersApiUrl, fetcher);
  const {
    data: invitations,
    error: invitationsError,
    isLoading: invitationsLoading,
  } = useSWR<Invitation[]>(invitationsApiUrl, fetcher);

  const isLoading = membersLoading || invitationsLoading;
  const error = membersError || invitationsError;

  const handleRemoveMember = async (memberId: string) => {
    setActionError(null);
    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
      const res = await fetch(`${membersApiUrl}/${memberId}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to remove member.');
      }
      mutate(membersApiUrl);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setActionError(err.message);
      } else {
        setActionError('An unknown error occurred.');
      }
    }
  };

  const handleRevokeInvitation = async (invitationId: string) => {
    setActionError(null);
    if (!confirm('Are you sure you want to revoke this invitation?')) return;

    try {
      const res = await fetch(`${invitationsApiUrl}/${invitationId}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to revoke invitation.');
      }
      mutate(invitationsApiUrl);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setActionError(err.message);
      } else {
        setActionError('An unknown error occurred.');
      }
    }
  };

  const handleRoleChange = async (memberId: string, role: Role) => {
    setActionError(null);
    try {
      const res = await fetch(`${membersApiUrl}/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to update role.');
      mutate(membersApiUrl);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setActionError(err.message);
      } else {
        setActionError('An unknown error occurred.');
      }
    }
  };

  if (isLoading) {
    return <div className="p-4 text-center">Loading members...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Failed to load members: {error.message}</div>;
  }

  return (
    <div className="space-y-8">
      {actionError && <p className="text-sm text-red-600">Error: {actionError}</p>}
      {/* Existing Members List */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Members</h3>
        <div className="divide-y divide-gray-200 rounded-md border">
          {members && members.length > 0 ? (
            members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <Image
                    src={member.user.image ?? `https://avatar.vercel.sh/${member.user.email}`}
                    alt={member.user.name ?? 'User avatar'}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full"
                    unoptimized
                  />
                  <div>
                    <p className="font-medium text-gray-900">{member.user.name}</p>
                    <p className="text-sm text-gray-500">{member.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {member.role === 'OWNER' ? (
                    <span className="text-sm text-gray-600 capitalize">{member.role.toLowerCase()}</span>
                  ) : (
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleChange(member.id, e.target.value as Role)}
                      className="text-sm text-gray-600 capitalize border-gray-300 rounded-md"
                    >
                      <option value="ADMIN">Admin</option>
                      <option value="EDITOR">Editor</option>
                      <option value="VIEWER">Viewer</option>
                    </select>
                  )}
                  {member.role !== 'OWNER' && (
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="text-sm text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="p-4 text-gray-500">No members found.</p>
          )}
        </div>
      </div>

      {/* Pending Invitations List */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Pending Invitations</h3>
        <div className="divide-y divide-gray-200 rounded-md border">
          {invitations && invitations.length > 0 ? (
            invitations.map((invitation) => (
              <div key={invitation.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                   <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                   </div>
                  <div>
                    <p className="font-medium text-gray-900">{invitation.email}</p>
                    <p className="text-sm text-gray-500">Invited</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600 capitalize">{invitation.role.toLowerCase()}</span>
                  <button
                    onClick={() => handleRevokeInvitation(invitation.id)}
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