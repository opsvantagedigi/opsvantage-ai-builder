import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * DELETE /api/workspaces/{workspaceId}/clients/{agencyClientId}
 * An agency revokes a pending invitation to manage a client.
 */
export async function DELETE(
  request: Request,
  { params }: { params: { workspaceId: string; agencyClientId: string } }
) {
  try {
    const { workspaceId, agencyClientId } = params;

    // 1. Authenticate and authorize the user (must be OWNER or ADMIN of the agency)
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const currentUserId = session.user.id;

    const currentUserMember = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: currentUserId } },
    });

    if (!currentUserMember || !['OWNER', 'ADMIN'].includes(currentUserMember.role)) {
      return NextResponse.json(
        { error: 'You do not have permission to manage client invitations.' },
        { status: 403 }
      );
    }

    // 2. Delete the invitation, ensuring it belongs to the correct agency workspace
    await prisma.agencyClient.delete({
      where: { id: agencyClientId, agencyId: workspaceId },
    });

    return NextResponse.json({ message: 'Invitation revoked successfully.' }, { status: 200 });
  } catch (error) {
    console.error('Error revoking client invitation:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}