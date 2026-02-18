import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/verify-session';
import { prisma } from '@/lib/prisma';
import { refactorPageData } from '@/lib/ai/design-assistant';
import { logActivity } from '@/lib/audit-logger';

export async function POST(req: Request) {
    const session = await verifySession();
    if (!session || !session?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { sections, instruction, workspaceId } = body;

        if (!sections || !instruction) {
            return NextResponse.json({ error: 'Missing sections or instruction' }, { status: 400 });
        }

        const user = await prisma.user.findFirst({ where: { email: session?.email, deletedAt: null } });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        // Try to get onboarding context if workspaceId is provided
        let onboarding = undefined;
        if (workspaceId) {
            const project = await prisma.project.findFirst({
                where: { workspaceId },
                include: { onboarding: true },
                orderBy: { createdAt: 'desc' }
            });
            onboarding = project?.onboarding || undefined;
        }

        const refactoredSections = await refactorPageData({ sections, instruction });

        // Log the activity
        if (workspaceId) {
            await logActivity({
                workspaceId,
                actorId: user.id,
                action: 'AI_REFACTOR_PAGE',
                entityType: 'AI_TASK',
                entityId: 'AI_REFACTOR', // Placeholder or task ID if we persist one
                metadata: { instruction, sectionCount: sections.length },
                ipAddress: req.headers.get('x-forwarded-for') || undefined,
                userAgent: req.headers.get('user-agent') || undefined,
            });
        }

        return NextResponse.json({ ok: true, sections: refactoredSections });
    } catch (error: any) {
        console.error('AI Refactor Failed:', error);
        return NextResponse.json({ error: 'AI failed to refactor page: ' + error.message }, { status: 500 });
    }
}
