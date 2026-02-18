import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

const isProduction = process.env.NODE_ENV === "production";
const isNextBuildPhase = process.env.NEXT_PHASE === "phase-production-build";
const skipStrictDuringBuild = String(process.env.SKIP_DB_CHECK_DURING_BUILD || "").toLowerCase() === "true";

// Enforce at runtime (production), but do NOT hard-fail during `next build`.
// Cloud Build runs `next build` without runtime secrets; those are injected at deploy time.
if (!process.env.NEXTAUTH_SECRET && isProduction && !isNextBuildPhase && !skipStrictDuringBuild) {
  throw new Error("CRITICAL: NEXTAUTH_SECRET MISSING");
}

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
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    jwt: async ({ token, user }: any) => {
      if (user) {
        token.sub = user.id;
        token.email = user.email;
      }
      return token;
    },
    session: async ({ session, token }: any) => {
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
};
