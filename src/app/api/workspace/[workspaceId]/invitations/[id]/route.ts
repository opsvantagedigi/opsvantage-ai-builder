import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/verify-session';
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
    const session = await verifySession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify permission
    const member = await db.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: session?.sub,
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
