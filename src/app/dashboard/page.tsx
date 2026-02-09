import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { authOptions } from '@/lib/auth';
import { CreateWorkspaceForm } from '../../../prisma/CreateWorkspaceForm';
import { WorkspaceList } from '../../../WorkspaceList';
import { MyDomainsList } from '../../../MyDomainsList';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // Manually verify the session using the JWT token from cookies
  const cookieStore = await cookies();
  const nextAuthSessionToken = cookieStore.get('next-auth.session-token');
  if (!nextAuthSessionToken) {
    redirect('/login');
  }

  try {
    // Verify the JWT token using the same secret as NextAuth
    const secret = process.env.NEXTAUTH_SECRET || 'dev-nextauth-secret';
    const verified = await jwtVerify(nextAuthSessionToken.value, new TextEncoder().encode(secret));
    
    const userId = verified.payload.sub;
    if (!userId) {
      redirect('/login');
    }
  } catch (err) {
    // If session verification fails, redirect to login to recover gracefully
    console.error('Session verification error:', err);
    redirect('/login');
  }

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Dashboard</h1>
      <WorkspaceList />
      <CreateWorkspaceForm />
      <MyDomainsList />
    </main>
  );
}
