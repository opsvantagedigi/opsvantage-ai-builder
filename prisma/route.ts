import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const acceptInviteSchema = z.object({
  token: z.string().min(1, 'Invitation token is required.'),
});

/**
 * POST /api/invitations/accept
 * Accepts a workspace invitation for the authenticated user.
 */
export async function POST(request: Request) {
  try {
    // 1. Authenticate the user
    const session = await getServerSession(authOptions);
    const user = session?.user as { id?: string | null; email?: string | null } | undefined;
    if (!user?.id || !user.email) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to accept the invitation.' },
        { status: 401 }
      );
    }
    const userId = user.id;
    const userEmail = user.email;

    // 2. Validate the request body
    const body = await request.json();
    const validation = acceptInviteSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { token } = validation.data;

    // 3. Find the pending invitation
    const invitation = await prisma.invitation.findUnique({
      where: { token },
    });

    if (!invitation || invitation.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Invitation is invalid or has expired.' }, { status: 404 });
    }

    // Security check: ensure the logged-in user's email matches the invitation email
    if (invitation.email.toLowerCase() !== userEmail.toLowerCase()) {
      return NextResponse.json({ error: 'This invitation is for a different user.' }, { status: 403 });
    }

    // 4. Add user to workspace and delete invitation in a transaction
    const [workspaceMember] = await prisma.$transaction([
      // Create the new workspace member
      prisma.workspaceMember.create({
        data: {
          workspaceId: invitation.workspaceId,
          userId: userId,
          role: invitation.role,
        },
      }),
      // Delete the used invitation
      prisma.invitation.delete({
        where: { id: invitation.id },
      }),
    ]);

    return NextResponse.json({
      message: 'Invitation accepted successfully!',
      workspaceId: workspaceMember.workspaceId,
    });
  } catch (error) {
    // Handle potential unique constraint violation if user is already a member
    if (typeof error === 'object' && error !== null && 'code' in error && (error as any).code === 'P2002') {
      return NextResponse.json(
        { error: 'You are already a member of this workspace.' },
        { status: 409 }
      );
    }
    console.error('Error accepting invitation:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while accepting the invitation.' },
      { status: 500 }
    );
  }
}