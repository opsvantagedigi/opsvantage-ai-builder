import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

export interface SessionPayload {
  email: string;
  sub: string;
  [key: string]: any;
}

/**
 * Verify the NextAuth session from cookies and return the session payload
 * This is used instead of getServerSession for Edge-compatible session verification
 */
export async function verifySession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token =
      cookieStore.get('next-auth.session-token')?.value ||
      cookieStore.get('__Secure-next-auth.session-token')?.value;

    if (!token) {
      return null;
    }

    try {
      const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
      const sessionPayload = await jwtVerify(token, secret);
      return {
        email: (sessionPayload.payload.email as string) || '',
        sub: (sessionPayload.payload.sub as string) || '',
        ...sessionPayload.payload,
      };
    } catch (error) {
      console.error('Session verification failed:', error);
      return null;
    }
  } catch (error) {
    console.error('Error checking session:', error);
    return null;
  }
}
