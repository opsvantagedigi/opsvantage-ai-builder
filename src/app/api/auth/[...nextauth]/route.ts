import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

const handler = NextAuth(authOptions)

// Diagnostic module-load logging to help surface environment and provider
// configuration in server runtime logs when the handler is initialized.
try {
	const hasSecret = !!process.env.NEXTAUTH_SECRET
	const googleId = !!process.env.GOOGLE_CLIENT_ID
	const providerNames = (authOptions.providers || []).map((p: any) => p.id || p.name)
	console.error('[nextauth:module] loaded', { hasSecret, googleId, providerNames })
} catch (e) {
	console.error('[nextauth:module] diag failed', String(e))
}

export { handler as GET, handler as POST }
