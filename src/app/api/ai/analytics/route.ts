import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateAnalyticsInsights } from '@/lib/ai/design-assistant';

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { workspaceId } = await req.json();

        if (!workspaceId) {
            return NextResponse.json({ error: 'Workspace ID is required' }, { status: 400 });
        }

        // Fetch usage data
        const usage = await prisma.usage.findUnique({
            where: { workspaceId }
        });

        // Fetch recent audit logs for context
        const recentLogs = await prisma.auditLog.findMany({
            where: { workspaceId },
            take: 20,
            orderBy: { createdAt: 'desc' },
            select: {
                action: true,
                createdAt: true,
                metadata: true
            }
        });

        // Prepare data for AI
        const analysisData = {
            usage,
            activitySummary: recentLogs.reduce((acc: any, log) => {
                acc[log.action] = (acc[log.action] || 0) + 1;
                return acc;
            }, {}),
            recentActivity: recentLogs
        };

        const insights = await generateAnalyticsInsights(analysisData);

        return NextResponse.json({ insights });
    } catch (error: any) {
        console.error('Analytics Insights Failed:', error);
        return NextResponse.json({ error: 'Failed to generate insights: ' + error.message }, { status: 500 });
    }
}
