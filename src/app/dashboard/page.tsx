import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { CreateWorkspaceForm } from '../../../prisma/CreateWorkspaceForm';
import { WorkspaceList } from '../../../WorkspaceList';
import { MyDomainsList } from '../../../MyDomainsList';
import { DashboardShell } from '@/components/layout/DashboardShell';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token =
    cookieStore.get('next-auth.session-token')?.value ||
    cookieStore.get('__Secure-next-auth.session-token')?.value;

  if (!token) {
    redirect('/login');
  }

  try {
    const secret = process.env.NEXTAUTH_SECRET || 'dev-nextauth-secret';
    const verified = await jwtVerify(token, new TextEncoder().encode(secret));
    if (!verified.payload.sub) {
      redirect('/login');
    }
  } catch (error) {
    console.error('Session verification error:', error);
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