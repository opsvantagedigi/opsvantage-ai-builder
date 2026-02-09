import { type NextAuthOptions, type User, type Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { JWT } from "next-auth/jwt";

const credentialProvider = CredentialsProvider({
  name: "Credentials",
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" }
  },
  async authorize(credentials: { email?: string }) {
    if (credentials?.email) {
      return { id: credentials.email, email: credentials.email }
    }
    return null
  }
})

const githubProvider = (process.env.GITHUB_ID && process.env.GITHUB_SECRET)
  ? GithubProvider({ clientId: process.env.GITHUB_ID, clientSecret: process.env.GITHUB_SECRET })
  : null

const googleProvider = (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
  ? GoogleProvider({ clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET })
  : null

export const authOptions: NextAuthOptions = {
  providers: ([
    credentialProvider,
    ...(githubProvider ? [githubProvider] : []),
    ...(googleProvider ? [googleProvider] : []),
  ].filter(Boolean)) as NextAuthOptions['providers'],
  session: { 
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  // Ensure a secret is always present to avoid runtime errors in production
  secret: process.env.NEXTAUTH_SECRET || 'dev-nextauth-secret',
  // Temporarily enable debug mode unconditionally to capture detailed
  // NextAuth logs in production. Revert this change after diagnostics.
  debug: true,
  // Ensure server-side errors and warnings are logged to runtime logs
  logger: {
    error(code, metadata) {
      console.error('NextAuth ERROR', code, metadata)
      // Best-effort: forward NextAuth errors to diagnostics endpoint so they
      // appear as dedicated log entries in production logs for easier filtering.
      try {
        const endpoint = (process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_VERCEL_URL || process.env.VERCEL_URL)
          ? `${process.env.NEXTAUTH_URL ?? `https://${process.env.NEXT_PUBLIC_VERCEL_URL ?? process.env.VERCEL_URL}`}/api/diagnostics/nextauth-errors`
          : undefined
        if (endpoint) {
          // fire-and-forget
          void fetch(endpoint, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ code, metadata, timestamp: new Date().toISOString() }),
          }).catch(() => undefined)
        }
      } catch (e) {
        // Ignore forwarding errors to avoid cascading failures
      }
    },
    warn(code) {
      console.warn('NextAuth WARN', code)
    },
    debug(code) {
      // Use console.error for debug-level messages so they are visible
      // in production runtime logs where console.debug may be filtered.
      console.error('NextAuth DEBUG', code)
    }
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.sub = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token.sub) {
        session.user = {
          ...session.user,
          id: token.sub as string
        };
      }
      if (token.email) {
        session.user = {
          ...session.user,
          email: token.email as string
        };
      }
      return session;
    }
  },
  pages: {
    signIn: '/login'
  },
  // Note: We rely on the `logger.error` handler above to capture runtime
  // NextAuth errors. Avoid adding an `events` block with incompatible typing
  // to keep the TypeScript build clean in production.
};
