'use server';

import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { randomBytes } from 'crypto';
import { getPlanById } from '@/config/subscriptions';

interface InviteMemberResult {
  success: boolean;
  error?: string;
  inviteLink?: string;
  message?: string;
}

/**
 * Send invitation to team member (Agency plan only, max 5 members)
 */
export async function inviteMemberAction(
  workspaceId: string,
  email: string,
  role: 'EDITOR' | 'VIEWER' = 'EDITOR'
): Promise<InviteMemberResult> {
  try {
    // 1. AUTHENTICATE
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized - please sign in' };
    }

    // 2. VERIFY WORKSPACE OWNERSHIP/ACCESS
    const member = await db.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: session.user.id,
        role: { in: ['OWNER', 'ADMIN'] }, // Only owner/admin can invite
      },
    });

    if (!member) {
      return { success: false, error: 'You do not have permission to invite members' };
    }

    // 3. CHECK SUBSCRIPTION (Agency plan only)
    const workspace = await db.workspace.findUnique({
      where: { id: workspaceId },
      include: { owner: true },
    });

    if (!workspace) {
      return { success: false, error: 'Workspace not found' };
    }

    const ownerSubscription = await db.user.findUnique({
      where: { id: workspace.ownerId },
    });

    // Get plan from subscription
    const planId = ownerSubscription?.stripePriceId
      ? getPlanById(ownerSubscription.stripePriceId)
      : null;

    if (!planId || planId.id !== 'agency') {
      return {
        success: false,
        error: 'Team invitations are only available on the Agency plan. Upgrade to invite team members.'
      };
    }

    // 4. CHECK TEAM MEMBER LIMIT (Max 5 members)
    const memberCount = await db.workspaceMember.count({
      where: { workspaceId },
    });

    if (memberCount >= 5) {
      return {
        success: false,
        error: 'Team member limit reached (Max 5). Remove a member to invite another.'
      };
    }

    // 5. CHECK IF EMAIL IS ALREADY INVITED OR IS MEMBER
    const existingInvite = await db.invitation.findFirst({
      where: {
        email,
        workspaceId,
        status: 'PENDING',
      },
    });

    if (existingInvite) {
      return { success: false, error: 'This email already has a pending invitation' };
    }

    const existingMember = await db.workspaceMember.findFirst({
      where: {
        workspace: { id: workspaceId },
        user: { email },
      },
    });

    if (existingMember) {
      return { success: false, error: 'This user is already a member of the workspace' };
    }

    // 6. CREATE INVITATION
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7-day expiry

    const invitation = await db.invitation.create({
      data: {
        email,
        token,
        role,
        workspaceId,
        inviterId: session.user.id,
        expiresAt,
        status: 'PENDING',
      },
    });

    console.log(`[MARZ] Invitation created: ${email} to workspace ${workspaceId}`);

    // TODO: Send email with invitation link
    // const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}`;
    // await sendInvitationEmail(email, inviteLink, workspace.name);

    return {
      success: true,
      message: `Invitation sent to ${email}`,
      // inviteLink: `${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}`, // For MVP, return link
    };
  } catch (error) {
    console.error('[MARZ] Error inviting member:', error);
    return { success: false, error: 'Failed to send invitation' };
  }
}

/**
 * Accept invitation and join workspace
 */
export async function acceptInvitationAction(token: string): Promise<InviteMemberResult> {
  try {
    // 1. FIND INVITATION
    const invitation = await db.invitation.findUnique({
      where: { token },
      include: { workspace: true },
    });

    if (!invitation) {
      return { success: false, error: 'Invalid or expired invitation' };
    }

    // 2. CHECK IF EXPIRED
    if (new Date() > invitation.expiresAt) {
      await db.invitation.update({
        where: { token },
        data: { status: 'EXPIRED' },
      });
      return { success: false, error: 'Invitation has expired' };
    }

    // 3. CHECK IF ALREADY ACCEPTED
    if (invitation.status === 'ACCEPTED') {
      return { success: false, error: 'Invitation already accepted' };
    }

    // 4. FIND OR CREATE USER
    let user = await db.user.findUnique({
      where: { email: invitation.email },
    });

    if (!user) {
      // For now, don't auto-create user - they must sign up first
      return {
        success: false,
        error: 'Please create an account first before accepting the invitation',
      };
    }

    // 5. ADD USER TO WORKSPACE
    const existingMember = await db.workspaceMember.findFirst({
      where: {
        workspaceId: invitation.workspaceId,
        userId: user.id,
      },
    });

    if (existingMember) {
      return { success: false, error: 'You are already a member of this workspace' };
    }

    await db.workspaceMember.create({
      data: {
        workspaceId: invitation.workspaceId,
        userId: user.id,
        role: invitation.role,
      },
    });

    // 6. MARK INVITATION AS ACCEPTED
    await db.invitation.update({
      where: { token },
      data: { status: 'ACCEPTED' },
    });

    console.log(`[MARZ] Invitation accepted: ${user.email} joined workspace ${invitation.workspaceId}`);

    return {
      success: true,
      message: `Welcome to ${invitation.workspace.name}!`,
    };
  } catch (error) {
    console.error('[MARZ] Error accepting invitation:', error);
    return { success: false, error: 'Failed to accept invitation' };
  }
}

/**
 * Revoke/cancel pending invitation
 */
export async function revokeinvitationAction(invitationId: string, workspaceId: string): Promise<InviteMemberResult> {
  try {
    // 1. AUTHENTICATE
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // 2. VERIFY PERMISSION
    const member = await db.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: session.user.id,
        role: { in: ['OWNER', 'ADMIN'] },
      },
    });

    if (!member) {
      return { success: false, error: 'You do not have permission to revoke invitations' };
    }

    // 3. REVOKE INVITATION
    const invitation = await db.invitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation || invitation.workspaceId !== workspaceId) {
      return { success: false, error: 'Invitation not found' };
    }

    await db.invitation.delete({
      where: { id: invitationId },
    });

    console.log(`[MARZ] Invitation revoked: ${invitationId}`);

    return { success: true, message: 'Invitation revoked' };
  } catch (error) {
    console.error('[MARZ] Error revoking invitation:', error);
    return { success: false, error: 'Failed to revoke invitation' };
  }
}

/**
 * List pending invitations for a workspace
 */
export async function listPendingInvitationsAction(workspaceId: string) {
  try {
    // 1. AUTHENTICATE
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // 2. VERIFY PERMISSION
    const member = await db.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: session.user.id,
        role: { in: ['OWNER', 'ADMIN'] },
      },
    });

    if (!member) {
      return { success: false, error: 'You do not have permission' };
    }

    // 3. GET PENDING INVITATIONS
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

    return {
      success: true,
      invitations: invitations.map((inv) => ({
        id: inv.id,
        email: inv.email,
        role: inv.role,
        invitedBy: inv.inviter.name || inv.inviter.email,
        expiresAt: inv.expiresAt,
        createdAt: inv.createdAt,
      })),
    };
  } catch (error) {
    console.error('[MARZ] Error listing invitations:', error);
    return { success: false, error: 'Failed to list invitations' };
  }
}
