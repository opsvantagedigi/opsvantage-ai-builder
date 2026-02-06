import { NextResponse } from 'next/server'

export const POST = async (req: Request) => {
  try {
    const body = await req.json().catch(() => null)
    // Log to console so this appears in runtime logs; include marker for easy filtering
    console.error('[diagnostics][nextauth-errors]', JSON.stringify({ receivedAt: new Date().toISOString(), body }))
    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    console.error('[diagnostics][nextauth-errors] failed to process', String(err))
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
