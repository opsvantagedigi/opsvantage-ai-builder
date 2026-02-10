import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/verify-session';
import { db } from '@/lib/db';

/**
 * POST: Accept invitation and join workspace
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const session = await verifySession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find invitation
    const invitation = await db.invitation.findUnique({
      where: { token },
      include: { workspace: true },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invalid or expired invitation' },
        { status: 404 }
      );
    }

    // Check expiry
    if (new Date() > invitation.expiresAt) {
      await db.invitation.update({
        where: { token },
        data: { status: 'EXPIRED' },
      });
      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 400 }
      );
    }

    // Check if already accepted
    if (invitation.status === 'ACCEPTED') {
      return NextResponse.json(
        { error: 'Invitation already accepted' },
        { status: 400 }
      );
    }

    // Verify email matches
    const user = await db.user.findUnique({
      where: { id: session?.sub },
    });

    if (!user || user.email !== invitation.email) {
      return NextResponse.json(
        {
          error: 'Invitation email does not match your account',
          hint: `This invitation was sent to ${invitation.email}`,
        },
        { status: 403 }
      );
    }

    // Check if already member
    const existingMember = await db.workspaceMember.findFirst({
      where: {
        workspaceId: invitation.workspaceId,
        userId: user.id,
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: 'You are already a member of this workspace' },
        { status: 400 }
      );
    }

    // Add to workspace
    await db.workspaceMember.create({
      data: {
        workspaceId: invitation.workspaceId,
        userId: user.id,
        role: invitation.role,
      },
    });

    // Mark as accepted
    await db.invitation.update({
      where: { token },
      data: { status: 'ACCEPTED' },
    });

    console.log(
      `[MARZ] Invitation accepted: ${user.email} joined ${invitation.workspace.name}`
    );

    return NextResponse.json({
      success: true,
      message: `Welcome to ${invitation.workspace.name}!`,
      workspace: {
        id: invitation.workspace.id,
        name: invitation.workspace.name,
      },
    });
  } catch (error) {
    console.error('[MARZ] Error accepting invitation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
