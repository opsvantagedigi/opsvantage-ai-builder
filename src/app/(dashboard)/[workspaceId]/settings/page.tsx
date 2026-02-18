import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { BrandingSettings } from '@/components/dashboard/BrandingSettings';
import { AuditLogList } from '@/components/dashboard/AuditLogList';
import { CompetitorAnalysis } from '@/components/dashboard/CompetitorAnalysis';
import { AnalyticsInsights } from '@/components/dashboard/AnalyticsInsights';
import { TeamManager } from '@/components/dashboard/TeamManager';
import { BillingManager } from '@/components/dashboard/BillingManager';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email;
  if (!userEmail) {
    redirect('/login');
  }

  const user = await prisma.user.findFirst({ where: { email: userEmail, deletedAt: null } });
  if (!user) {
    redirect('/login');
  }

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
      <DashboardShell title="Workspace Settings" description="Administrative access is required for this workspace.">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-300">
          <h2 className="text-xl font-semibold">Access denied</h2>
          <p className="mt-2 text-sm">You do not have permission to view this workspace settings page.</p>
        </div>
      </DashboardShell>
    );
  }

  const workspace = await prisma.workspace.findFirst({
    where: { id: workspaceId, deletedAt: null },
    include: {
      auditLogs: {
        take: 50,
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!workspace) {
    notFound();
  }

  return (
    <DashboardShell title="Workspace Settings" description="Configure branding, governance, and AI optimization controls for this workspace.">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="space-y-8 md:col-span-2">
          <section id="branding" className="surface-card !p-0 overflow-hidden">
            <BrandingSettings
              workspaceId={workspaceId}
              initialData={{
                brandingLogo: (workspace as any).brandingLogo,
                brandingColors: (workspace as any).brandingColors,
                customDashboardDomain: (workspace as any).customDashboardDomain,
              }}
            />
          </section>

          <section id="competitor-analysis" className="surface-card !p-0 overflow-hidden">
            <CompetitorAnalysis workspaceId={workspaceId} />
          </section>

          <section id="analytics-insights" className="surface-card !p-0 overflow-hidden">
            <AnalyticsInsights workspaceId={workspaceId} />
          </section>

          <section id="team" className="surface-card !p-0 overflow-hidden">
            <TeamManager workspaceId={workspaceId} currentUserId={user.email!} />
          </section>

          {member.role === 'OWNER' && (
            <section id="billing-mgmt" className="surface-card !p-0 overflow-hidden">
              <BillingManager workspaceId={workspaceId} />
            </section>
          )}

          <section id="audit-logs" className="surface-card !p-0 overflow-hidden">
            <div className="border-b border-slate-200 p-6 dark:border-slate-800">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Audit Logs</h2>
            </div>
            <AuditLogList logs={(workspace as any).auditLogs} />
          </section>
        </div>

        <aside className="hidden md:block">
          <nav className="sticky top-24 space-y-1 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <a href="#branding" className="block rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">
              Branding
            </a>
            <a href="#competitor-analysis" className="block rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">
              Competitor Analysis
            </a>
            <a href="#analytics-insights" className="block rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">
              AI Optimization
            </a>
            <a href="#team" className="block rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">
              Team
            </a>
            {member.role === 'OWNER' && (
              <a href="#billing-mgmt" className="block rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">
                Billing
              </a>
            )}
            <a href="#audit-logs" className="block rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">
              Audit Logs
            </a>
          </nav>
        </aside>
      </div>
    </DashboardShell>
  );
}
