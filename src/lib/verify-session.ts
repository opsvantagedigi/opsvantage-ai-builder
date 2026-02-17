import { getServerSession } from 'next-auth';
import { cookies } from 'next/headers';
import { authOptions } from '@/lib/auth';
import { isValidSovereignKey } from '@/lib/sovereign-auth';

export interface SessionPayload {
  email: string;
  sub: string;
  [key: string]: any;
}

const SOVEREIGN_SUB = 'sovereign-admin';
const SOVEREIGN_EMAIL = 'sovereign@opsvantage.local';

/**
 * Resolve the NextAuth server session and normalize it to a lightweight payload.
 */
export async function verifySession(inputPassword?: string): Promise<SessionPayload | null> {
  try {
    if (isValidSovereignKey(inputPassword ?? '')) {
      return {
        email: SOVEREIGN_EMAIL,
        sub: SOVEREIGN_SUB,
        role: 'SOVEREIGN',
      };
    }

    const cookieStore = await cookies();
    const sovereignToken = cookieStore.get('zenith_admin_token')?.value;
    if (sovereignToken) {
      return {
        email: SOVEREIGN_EMAIL,
        sub: SOVEREIGN_SUB,
        role: 'SOVEREIGN',
      };
    }

    const session = await getServerSession(authOptions);
    const email = session?.user?.email;
    const userId = (session?.user as { id?: string } | undefined)?.id;
    if (typeof email !== 'string' || typeof userId !== 'string' || !email || !userId) {
      return null;
    }

    return {
      ...session.user,
      email,
      sub: userId,
    };
  } catch (error) {
    console.error('Error resolving server session:', error);
    return null;
  }
}
