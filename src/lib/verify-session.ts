import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export interface SessionPayload {
  email: string;
  sub: string;
  [key: string]: any;
}

/**
 * Resolve the NextAuth server session and normalize it to a lightweight payload.
 */
export async function verifySession(): Promise<SessionPayload | null> {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;
    const userId = (session?.user as { id?: string } | undefined)?.id;
    if (!email || !userId) {
      return null;
    }

    return {
      email,
      sub: userId,
      ...session.user,
    };
  } catch (error) {
    console.error('Error resolving server session:', error);
    return null;
  }
}
