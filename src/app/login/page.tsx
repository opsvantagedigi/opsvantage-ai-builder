"use client"

import { useEffect, useState } from "react"
import { signIn } from "next-auth/react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [providers, setProviders] = useState<Record<string, unknown> | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    await signIn("credentials", {
      email,
      password,
      callbackUrl: "/dashboard"
    })
  }

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/auth/providers')
        const data = await res.json()
        if (mounted) setProviders(data)
      } catch (e) {
        // ignore
      }
    })()
    return () => { mounted = false }
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-6 text-gray-900">Sign in to your account</h1>

        <label className="block text-sm text-gray-700 mb-1">Email</label>
        <input
          type="email"
          placeholder="you@example.com"
          className="w-full border border-gray-300 p-3 mb-4 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label className="block text-sm text-gray-700 mb-1">Password</label>
        <input
          type="password"
          placeholder="Password"
          className="w-full border border-gray-300 p-3 mb-4 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded mb-4"
        >
          Sign in
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-gray-200" />
          <div className="text-sm text-gray-500">or continue with</div>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {providers && Object.keys(providers).filter(k => k !== 'credentials').map((key) => {
          const prov = providers ? (providers[key] as Record<string, unknown>) : null
          return (
            <button
              key={String(prov?.id)}
              type="button"
              onClick={() => signIn(String(prov?.id), { callbackUrl: '/dashboard' })}
              className="w-full border border-gray-300 py-2 rounded flex items-center justify-center gap-2 mb-3 bg-white hover:bg-gray-50"
            >
              {String(prov?.id) === 'google' ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18" height="18"><path fill="#EA4335" d="M24 9.5c3.9 0 6.8 1.6 8.5 2.9l6.2-6.1C35 3.1 30.9 1.5 24 1.5 14.6 1.5 6.9 6.9 3.4 14.5l7 5.4C12.6 15 17.7 9.5 24 9.5z"/><path fill="#34A853" d="M46.5 24c0-1.6-.1-2.6-.4-3.8H24v7.2h12.7c-.5 3-2.9 7-8.2 9.2l6.2 4.8C43.5 37.1 46.5 31.1 46.5 24z"/><path fill="#4A90E2" d="M10.4 29.9A14.9 14.9 0 0 1 9.2 24c0-1.2.2-2.3.5-3.4L3 15.2A23.9 23.9 0 0 0 1.5 24c0 3.9 1 7.6 2.9 10.9l6-5z"/><path fill="#FBBC05" d="M24 46.5c6.9 0 12.9-2.3 17.2-6.2l-6.2-4.8c-2 1.4-5.1 2.7-11 2.7-6.3 0-11.4-5.5-12.9-12.6l-7 5.4C6.9 41.1 14.6 46.5 24 46.5z"/></svg>
                  <span className="text-sm text-gray-700">Continue with Google</span>
                </>
              ) : (
                <span className="text-sm text-gray-700">Continue with {String(prov?.name)}</span>
              )}
            </button>
          )
        })}
      </form>
    </div>
  )
}