import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

/**
 * Schema for validating the role update request.
 */
const updateRoleSchema = z.object({
  role: z.nativeEnum(Role),
});

/**
 * DELETE /api/workspaces/{workspaceId}/members/{memberId}
 * Removes a member from a workspace.
 */
export async function DELETE(
  request: Request,
  { params }: { params: { workspaceId: string; memberId: string } }
) {
  try {
    const { workspaceId, memberId } = params;

    // 1. Authenticate and authorize the user (must be OWNER or ADMIN)
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
        { error: 'You do not have permission to remove members.' },
        { status: 403 }
      );
    }

    // 2. Find the member to be removed
    const memberToRemove = await prisma.workspaceMember.findUnique({
      where: { id: memberId },
    });

    if (!memberToRemove || memberToRemove.workspaceId !== workspaceId) {
      return NextResponse.json({ error: 'Member not found in this workspace.' }, { status: 404 });
    }

    // 3. Business logic: Prevent owner from being removed
    if (memberToRemove.role === 'OWNER') {
      return NextResponse.json({ error: 'Cannot remove the workspace owner.' }, { status: 400 });
    }

    // 4. Delete the member
    await prisma.workspaceMember.delete({ where: { id: memberId } });

    return NextResponse.json({ message: 'Member removed successfully.' }, { status: 200 });
  } catch (error) {
    console.error('Error removing member:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}

/**
 * PATCH /api/workspaces/{workspaceId}/members/{memberId}
 * Updates the role of a workspace member.
 */
export async function PATCH(
  request: Request,
  { params }: { params: { workspaceId: string; memberId: string } }
) {
  try {
    const { workspaceId, memberId } = params;

    // 1. Authenticate and authorize the user (must be OWNER or ADMIN)
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
        { error: 'You do not have permission to change roles.' },
        { status: 403 }
      );
    }

    // 2. Validate request body
    const body = await request.json();
    const validation = updateRoleSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid role provided.' }, { status: 400 });
    }
    const { role: newRole } = validation.data;

    // 3. Find the member to be updated
    const memberToUpdate = await prisma.workspaceMember.findUnique({
      where: { id: memberId },
    });

    if (!memberToUpdate || memberToUpdate.workspaceId !== workspaceId) {
      return NextResponse.json({ error: 'Member not found in this workspace.' }, { status: 404 });
    }

    // 4. Business logic
    if (memberToUpdate.role === 'OWNER' || newRole === 'OWNER') {
      return NextResponse.json({ error: 'Cannot change the owner role.' }, { status: 400 });
    }
    if (memberToUpdate.userId === currentUserId) {
      return NextResponse.json({ error: 'You cannot change your own role.' }, { status: 400 });
    }

    // 5. Update the member's role
    const updatedMember = await prisma.workspaceMember.update({
      where: { id: memberId },
      data: { role: newRole },
    });

    return NextResponse.json(updatedMember);
  } catch (error) {
    console.error('Error updating member role:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}