import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/verify-session';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ workspaceId: string }> }) {
    const session = await verifySession();
    if (!session || !session?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { workspaceId } = await params;

        const user = await prisma.user.findFirst({ where: { email: session?.email, deletedAt: null } });
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

        const workspace = await prisma.workspace.findFirst({
            where: { id: workspaceId, deletedAt: null },
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
