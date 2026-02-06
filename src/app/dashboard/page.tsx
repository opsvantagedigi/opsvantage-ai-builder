import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { CreateWorkspaceForm } from '../../../prisma/CreateWorkspaceForm';
import { WorkspaceList } from '../../../WorkspaceList';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch (err) {
    // If session retrieval fails, redirect to login to recover gracefully
    console.error('getServerSession error:', err);
    redirect('/login');
  }

  if (!session) redirect('/login');

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Dashboard</h1>
      <WorkspaceList />
      <CreateWorkspaceForm />
    </main>
  );
}
