import { getServerSession } from 'next-auth';
import { notFound, redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { BrandingSettings } from '@/components/dashboard/BrandingSettings';
import { AuditLogList } from '@/components/dashboard/AuditLogList';

export const dynamic = 'force-dynamic';

export default async function SettingsPage({
    params,
}: {
    params: Promise<{ workspaceId: string }>;
}) {
    const { workspaceId } = await params;
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) redirect('/login');

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
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
                include: {
                    actor: {
                        select: { name: true, email: true }
                    }
                }
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
                                brandingLogo: workspace.brandingLogo,
                                brandingColors: workspace.brandingColors,
                                customDashboardDomain: workspace.customDashboardDomain,
                            }}
                        />
                    </section>

                    {/* Audit Logs Section */}
                    <section id="audit-logs">
                        <h2 className="text-xl font-semibold mb-4">Audit Logs</h2>
                        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                            <AuditLogList logs={workspace.auditLogs} />
                        </div>
                    </section>
                </div>

                {/* Sidebar Nav */}
                <div className="hidden md:block">
                    <nav className="sticky top-8 space-y-1">
                        <a href="#branding" className="block px-3 py-2 text-sm font-medium text-slate-700 bg-slate-50 rounded-md">Branding</a>
                        <a href="#audit-logs" className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-md">Audit Logs</a>
                    </nav>
                </div>
            </div>
        </div>
    );
}
