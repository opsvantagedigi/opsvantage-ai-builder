import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/verify-session';
import { prisma } from '@/lib/prisma';
import { logActivity } from '@/lib/audit-logger';

export async function GET(req: Request, { params }: { params: Promise<{ workspaceId: string }> }) {
    const session = await verifySession();
    if (!session || !session?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { workspaceId } = await params;

        const user = await prisma.user.findUnique({ where: { email: session?.email } });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const member = await prisma.workspaceMember.findUnique({
            where: {
                workspaceId_userId: {
                    workspaceId,
                    userId: user.id,
                },
            },
        });

        if (!member || (member.role !== 'OWNER' && member.role !== 'ADMIN')) {
            return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
        }

        const members = await prisma.workspaceMember.findMany({
            where: { workspaceId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        return NextResponse.json(members);
    } catch (error: any) {
        console.error('Failed to fetch members:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ workspaceId: string }> }) {
    const session = await verifySession();
    if (!session || !session?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { workspaceId } = await params;
        const { memberId } = await req.json();

        const user = await prisma.user.findUnique({ where: { email: session?.email } });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const currentMember = await prisma.workspaceMember.findUnique({
            where: {
                workspaceId_userId: {
                    workspaceId,
                    userId: user.id,
                },
            },
        });

        if (!currentMember || (currentMember.role !== 'OWNER' && currentMember.role !== 'ADMIN')) {
            return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
        }

        const targetMember = await prisma.workspaceMember.findUnique({
            where: { id: memberId },
        });

        if (!targetMember) {
            return NextResponse.json({ error: 'Member not found' }, { status: 404 });
        }

        // Role safety: ADMIN can't remove OWNER or other ADMINs
        if (currentMember.role === 'ADMIN' && (targetMember.role === 'OWNER' || targetMember.role === 'ADMIN')) {
            return NextResponse.json({ error: 'Admins cannot remove other admins or owners' }, { status: 403 });
        }

        // OWNER can't remove themselves (must transfer ownership or delete workspace)
        if (targetMember.userId === session?.sub) {
            return NextResponse.json({ error: 'Owners cannot remove themselves' }, { status: 400 });
        }

        await prisma.workspaceMember.delete({
            where: { id: memberId },
        });

        await logActivity({
            workspaceId,
            actorId: user.id,
            action: 'REMOVE_MEMBER',
            entityType: 'MEMBER',
            entityId: memberId,
            metadata: { targetUserId: targetMember.userId },
            ipAddress: req.headers.get('x-forwarded-for') || undefined,
            userAgent: req.headers.get('user-agent') || undefined,
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Failed to remove member:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
