import { NextResponse } from 'next/server'

function present(name: string) {
  return typeof process.env[name] !== 'undefined'
}

const NON_SECRET_SHOW = ['NEXTAUTH_URL', 'NEXT_PUBLIC_VERCEL_URL', 'VERCEL_URL']

export async function GET() {
  const required = [
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'DATABASE_URL',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GITHUB_ID',
    'GITHUB_SECRET',
    'SANITY_PROJECT_ID',
    'SANITY_DATASET',
    'SANITY_WRITE_TOKEN',
  ]

  const result: Record<string, { present: boolean; value?: string }> = {}

  for (const name of required) {
    result[name] = { present: present(name) }
    if (NON_SECRET_SHOW.includes(name) && present(name)) {
      result[name].value = process.env[name]
    }
  }

  const nextauthUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_VERCEL_URL || process.env.VERCEL_URL || null
  const expectedCallbacks = nextauthUrl
    ? {
        google: `${nextauthUrl.replace(/\/$/, '')}/api/auth/callback/google`,
        github: `${nextauthUrl.replace(/\/$/, '')}/api/auth/callback/github`,
      }
    : null

  return NextResponse.json({ ok: true, nextauthUrl, required: result, expectedCallbacks })
}
