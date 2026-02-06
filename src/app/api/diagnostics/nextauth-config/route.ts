import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'

export const GET = async () => {
  try {
    const hasSecret = !!process.env.NEXTAUTH_SECRET
    const googleClientId = process.env.GOOGLE_CLIENT_ID || null
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET ? '***' : null
    const providers = (authOptions.providers || []).map((p: any) => ({ id: p.id || p.name, name: p.name }))
    return NextResponse.json({ hasSecret, googleClientId, googleClientSecret, providers })
  } catch (e: any) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
