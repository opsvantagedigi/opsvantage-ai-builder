import { type NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
  providers: [
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
  ],
  session: { strategy: "jwt" },
  // Ensure a secret is always present to avoid runtime errors in production
  secret: process.env.NEXTAUTH_SECRET || 'dev-nextauth-secret',
  pages: {
    signIn: '/login'
  }
}
