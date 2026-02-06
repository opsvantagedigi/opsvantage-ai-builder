import { type NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GithubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"

const providers: any[] = [
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" }
    },
    async authorize(credentials) {
      if (credentials?.email) {
        return { id: credentials.email, email: credentials.email }
      }
      return null
    }
  })
]

if (process.env.GITHUB_ID && process.env.GITHUB_SECRET) {
  providers.push(
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    })
  )
}

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  )
}

export const authOptions: NextAuthOptions = {
  providers,
  session: { strategy: "jwt" },
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
      console.debug('NextAuth DEBUG', code)
    }
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.user = user as any
      return token
    },
    async session({ session, token }) {
      if (token && (token as any).user) {
        session.user = (token as any).user
      }
      return session
    }
  },
  pages: {
    signIn: '/login'
  }
  ,
  // Note: We rely on the `logger.error` handler above to capture runtime
  // NextAuth errors. Avoid adding an `events` block with incompatible typing
  // to keep the TypeScript build clean in production.
}
