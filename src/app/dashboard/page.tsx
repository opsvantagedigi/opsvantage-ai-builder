import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { CreateWorkspaceForm } from '../../../prisma/CreateWorkspaceForm';
import { WorkspaceList } from '../../../WorkspaceList';
import { MyDomainsList } from '../../../MyDomainsList';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect('/login');
  }

  return (
    <DashboardShell
      title="Workspace Dashboard"
      description="Manage workspaces, domains, and production website operations from a single control surface."
    >
      <div className="space-y-6">
        <WorkspaceList />
        <CreateWorkspaceForm />
        <MyDomainsList />
      </div>
    </DashboardShell>
  );
}
