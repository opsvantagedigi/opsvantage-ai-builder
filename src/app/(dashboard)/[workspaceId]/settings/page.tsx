import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { notFound, redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { BrandingSettings } from '@/components/dashboard/BrandingSettings';
import { AuditLogList } from '@/components/dashboard/AuditLogList';
import { CompetitorAnalysis } from '@/components/dashboard/CompetitorAnalysis';
import { AnalyticsInsights } from '@/components/dashboard/AnalyticsInsights';
import { TeamManager } from '@/components/dashboard/TeamManager';
import { BillingManager } from '@/components/dashboard/BillingManager';

export const dynamic = 'force-dynamic';

export default async function SettingsPage({
    params,
}: {
    params: Promise<{ workspaceId: string }>;
}) {
    const { workspaceId } = await params;
    
    // Manually verify the session using the JWT token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('next-auth.session-token')?.value || 
                 cookieStore.get('__Secure-next-auth.session-token')?.value;
    
    if (!token) {
      redirect('/login');
    }

    let sessionPayload;
    try {
      // Verify the JWT token using the NEXTAUTH_SECRET
      const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
      sessionPayload = await jwtVerify(token, secret);
    } catch (error) {
      console.error('Session verification failed:', error);
      redirect('/login');
    }

    // Extract user email from the verified token
    const userEmail = sessionPayload.payload.email as string;
    if (!userEmail) {
      redirect('/login');
    }

    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) redirect('/login');

    const member = await prisma.workspaceMember.findUnique({
        where: {
            workspaceId_userId: {
                workspaceId,
                userId: user.id,
            },
        },
    });

    if (!member || (member.role !== 'OWNER' && member.role !== 'ADMIN')) {
        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
                <p>You do not have permission to view this page.</p>
            </div>
        );
    }

    const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        include: {
            auditLogs: {
                take: 50,
                orderBy: { createdAt: 'desc' },
            }
        }
    });

    if (!workspace) notFound();

    return (
        <div className="container mx-auto py-8 px-4 max-w-5xl">
            <h1 className="text-3xl font-bold mb-8">Workspace Settings</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-12">
                    {/* Branding Section */}
                    <section id="branding">
                        <BrandingSettings
                            workspaceId={workspaceId}
                            initialData={{
                                brandingLogo: (workspace as any).brandingLogo,
                                brandingColors: (workspace as any).brandingColors,
                                customDashboardDomain: (workspace as any).customDashboardDomain,
                            }}
                        />
                    </section>

                    {/* Competitor Analysis Section */}
                    <section id="competitor-analysis">
                        <CompetitorAnalysis workspaceId={workspaceId} />
                    </section>

                    {/* Analytics Insights Section */}
                    <section id="analytics-insights">
                        <AnalyticsInsights workspaceId={workspaceId} />
                    </section>

                    {/* Team Section */}
                    <section id="team">
                        <TeamManager workspaceId={workspaceId} currentUserId={user.email!} />
                    </section>

                    {/* Billing Section - OWNER only */}
                    {member.role === 'OWNER' && (
                        <section id="billing-mgmt">
                            <BillingManager workspaceId={workspaceId} />
                        </section>
                    )}

                    {/* Audit Logs Section */}
                    <section id="audit-logs">
                        <h2 className="text-xl font-semibold mb-4">Audit Logs</h2>
                        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                            <AuditLogList logs={(workspace as any).auditLogs} />
                        </div>
                    </section>
                </div>

                {/* Sidebar Nav */}
                <div className="hidden md:block">
                    <nav className="sticky top-8 space-y-1">
                        <a href="#branding" className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-md">Branding</a>
                        <a href="#competitor-analysis" className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-md">Competitor Analysis</a>
                        <a href="#analytics-insights" className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-md">AI Optimization</a>
                        <a href="#team" className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-md">Team</a>
                        {member.role === 'OWNER' && (
                            <a href="#billing-mgmt" className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-md">Billing</a>
                        )}
                        <a href="#audit-logs" className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-md">Audit Logs</a>
                    </nav>
                </div>
            </div>
        </div>
    );
}
