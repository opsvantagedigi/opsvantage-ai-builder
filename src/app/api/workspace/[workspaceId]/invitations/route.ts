import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/verify-session';
import { db } from '@/lib/db';
import { randomBytes } from 'crypto';
import { getPlanById } from '@/config/subscriptions';

/**
 * GET: List pending invitations for workspace
 * POST: Send new invitation
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params;
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

    const invitations = await db.invitation.findMany({
      where: {
        workspaceId,
        status: 'PENDING',
      },
      include: {
        inviter: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      invitations: invitations.map((inv) => ({
        id: inv.id,
        email: inv.email,
        role: inv.role,
        invitedBy: inv.inviter.name || inv.inviter.email,
        expiresAt: inv.expiresAt,
        createdAt: inv.createdAt,
      })),
    });
  } catch (error) {
    console.error('[MARZ] Error fetching invitations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params;
    const session = await verifySession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email, role = 'EDITOR' } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
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

    // Check subscription (Agency only)
    const workspace = await db.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    const owner = await db.user.findUnique({
      where: { id: workspace.ownerId },
    });

    if (!owner?.stripePriceId) {
      return NextResponse.json(
        {
          error: 'Team invitations require Agency plan',
          code: 'UPGRADE_REQUIRED',
        },
        { status: 403 }
      );
    }

    const plan = getPlanById(owner.stripePriceId);
    if (plan?.id !== 'agency') {
      return NextResponse.json(
        {
          error: 'Team invitations are only available on Agency plan',
          code: 'UPGRADE_REQUIRED',
        },
        { status: 403 }
      );
    }

    // Check team member limit
    const memberCount = await db.workspaceMember.count({
      where: { workspaceId },
    });

    if (memberCount >= 5) {
      return NextResponse.json(
        { error: 'Team member limit reached (Max 5)' },
        { status: 403 }
      );
    }

    // Check if already invited or member
    const existingInvite = await db.invitation.findFirst({
      where: {
        email,
        workspaceId,
        status: 'PENDING',
      },
    });

    if (existingInvite) {
      return NextResponse.json(
        { error: 'This email already has a pending invitation' },
        { status: 400 }
      );
    }

    const existingMember = await db.workspaceMember.findFirst({
      where: {
        workspace: { id: workspaceId },
        user: { email },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: 'This user is already a member' },
        { status: 400 }
      );
    }

    // Create invitation
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = await db.invitation.create({
      data: {
        email,
        token,
        role,
        workspaceId,
        inviterId: session?.sub,
        expiresAt,
        status: 'PENDING',
      },
    });

    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}`;

    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
      },
      inviteLink, // For MVP - should send via email
    });
  } catch (error) {
    console.error('[MARZ] Error creating invitation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
