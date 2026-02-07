import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { analyzeCompetitor } from '@/lib/ai/design-assistant';
import { logActivity } from '@/lib/audit-logger';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { competitorUrl, workspaceId } = await req.json();

        if (!competitorUrl) {
            return NextResponse.json({ error: 'Competitor URL is required' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        // Fetch competitor content
        // Note: In a production app, you might use a more robust scraping service
        // or a headfull browser to handle SPAs. For now, we do a simple fetch.
        const response = await fetch(competitorUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch competitor site: ${response.statusText}`);
        }

        const html = await response.text();
        // Basic cleanup to reduce token usage
        const bodyContent = html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gm, '')
            .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gm, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        const analysis = await analyzeCompetitor(bodyContent);

        // Log the activity
        if (workspaceId) {
            await logActivity({
                workspaceId,
                actorId: user.id,
                action: 'AI_COMPETITOR_ANALYSIS',
                entityType: 'AI_TASK',
                entityId: 'COMP_ANALYSIS',
                metadata: { competitorUrl, tone: analysis.tone },
                ipAddress: req.headers.get('x-forwarded-for') || undefined,
                userAgent: req.headers.get('user-agent') || undefined,
            });
        }

        return NextResponse.json(analysis);
    } catch (error: any) {
        console.error('Competitor Analysis Failed:', error);
        return NextResponse.json({ error: 'Failed to analyze competitor: ' + error.message }, { status: 500 });
    }
}
