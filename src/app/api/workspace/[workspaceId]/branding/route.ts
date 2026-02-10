import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/verify-session';
import { prisma } from '@/lib/prisma';
import { logActivity } from '@/lib/audit-logger';

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ workspaceId: string }> }
) {
    const { workspaceId } = await params;
    const session = await verifySession();
    if (!session || !session?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { brandingLogo, brandingColors, customDashboardDomain } = body;

    try {
        const user = await prisma.user.findUnique({ where: { email: session?.email } });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        // Check if user is an admin/owner of the workspace
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

        const updatedWorkspace = await prisma.workspace.update({
            where: { id: workspaceId },
            data: {
                brandingLogo,
                brandingColors,
                customDashboardDomain,
            },
        });

        await logActivity({
            workspaceId,
            actorId: user.id,
            action: 'UPDATE_BRANDING',
            entityType: 'WORKSPACE',
            entityId: workspaceId,
            metadata: { brandingLogo, brandingColors, customDashboardDomain },
            ipAddress: req.headers.get('x-forwarded-for') || undefined,
            userAgent: req.headers.get('user-agent') || undefined,
        });

        return NextResponse.json(updatedWorkspace);
    } catch (error: any) {
        console.error('Branding update failed:', error);
        return NextResponse.json({ error: 'Failed to update branding' }, { status: 500 });
    }
}
