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
}
