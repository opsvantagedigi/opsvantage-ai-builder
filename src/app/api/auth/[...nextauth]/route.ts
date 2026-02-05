import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // TEMPORARY: allow any login for now
        if (credentials?.email) {
          return { id: credentials.email, email: credentials.email }
        }
        return null
      }
    })
  ],
  session: { strategy: "jwt" }
})

export { handler as GET, handler as POST }
