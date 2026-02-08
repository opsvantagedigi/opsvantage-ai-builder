import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

/**
 * DELETE: Revoke pending invitation
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; id: string }> }
) {
  try {
    const { workspaceId, id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify permission
    const member = await db.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: session.user.id,
        role: { in: ['OWNER', 'ADMIN'] },
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: 'You do not have permission' },
        { status: 403 }
      );
    }

    // Find and delete invitation
    const invitation = await db.invitation.findUnique({
      where: { id },
    });

    if (!invitation || invitation.workspaceId !== workspaceId) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      );
    }

    await db.invitation.delete({
      where: { id },
    });

    console.log(`[MARZ] Invitation revoked: ${id}`);

    return NextResponse.json({
      success: true,
      message: 'Invitation revoked',
    });
  } catch (error) {
    console.error('[MARZ] Error revoking invitation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
