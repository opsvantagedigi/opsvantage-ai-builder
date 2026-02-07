import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ workspaceId: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { workspaceId } = await params;

        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const member = await prisma.workspaceMember.findUnique({
            where: {
                workspaceId_userId: {
                    workspaceId,
                    userId: user.id,
                },
            },
        });

        // RBAC: Billing is OWNER only
        if (!member || member.role !== 'OWNER') {
            return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
        }

        const workspace = await prisma.workspace.findUnique({
            where: { id: workspaceId },
            select: {
                plan: true,
                stripeCustomerId: true,
                stripeSubscriptionId: true,
                stripeCurrentPeriodEnd: true,
            },
        });

        return NextResponse.json(workspace);
    } catch (error: any) {
        console.error('Failed to fetch billing info:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
