'use client';

import useSWR from 'swr';
import { User, WorkspaceMember, Invitation } from '@prisma/client';

interface WorkspaceMembersListProps {
  workspaceId: string;
}

type MemberWithUser = WorkspaceMember & {
  user: Pick<User, 'id' | 'name' | 'email' | 'image'>;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

/**
 * A component to display existing members and pending invitations for a workspace.
 */
export function WorkspaceMembersList({ workspaceId }: WorkspaceMembersListProps) {
  const {
    data: members,
    error: membersError,
    isLoading: membersLoading,
  } = useSWR<MemberWithUser[]>(`/api/workspaces/${workspaceId}/members`, fetcher);

  const {
    data: invitations,
    error: invitationsError,
    isLoading: invitationsLoading,
  } = useSWR<Invitation[]>(`/api/workspaces/${workspaceId}/invitations`, fetcher);

  const isLoading = membersLoading || invitationsLoading;
  const error = membersError || invitationsError;

  if (isLoading) {
    return <div className="p-4 text-center">Loading members...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Failed to load members: {error.message}</div>;
  }

  return (
    <div className="space-y-8">
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
                  <span className="text-sm text-gray-600 capitalize">{member.role.toLowerCase()}</span>
                  {/* Placeholder for future actions */}
                  <button className="text-sm text-red-500 hover:text-red-700" disabled>
                    Remove
                  </button>
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
                  {/* Placeholder for future actions */}
                  <button className="text-sm text-red-500 hover:text-red-700" disabled>
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