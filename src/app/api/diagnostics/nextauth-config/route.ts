import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'

export const GET = async () => {
  try {
    const hasSecret = !!process.env.NEXTAUTH_SECRET
    const googleClientId = process.env.GOOGLE_CLIENT_ID || null
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET ? '***' : null
    const providers = (authOptions.providers || []).map((p: unknown) => {
      const o = p as Record<string, unknown>
      return { id: (o.id as string) || (o.name as string), name: (o.name as string) }
    })
    return NextResponse.json({ hasSecret, googleClientId, googleClientSecret, providers })
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
