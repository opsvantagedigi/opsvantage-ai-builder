import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { logger } from "@/lib/logger"

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

export const POST = async (req: Request) => {
  try {
    // Log request metadata to help diagnose 405/validation issues in production
    const headerObj = Object.fromEntries(req.headers.entries())
    const rawText = await req.text().catch(() => '')
    // Prefer console logging so it always appears even if pino transport fails
    console.error('[api/register] incoming request', { method: req.method, headers: headerObj, bodyPreview: rawText?.slice(0, 1000) })
    try {
      logger.info?.(`api/register incoming. Method: ${req.method}`)
    } catch (e) {
      // ignore logger failures
    }

    let body: unknown = {}
    if (rawText) {
      try {
        body = JSON.parse(rawText)
      } catch (e) {
        const ex = e as Error
        return NextResponse.json({ error: 'Invalid JSON', message: String(ex), rawBodyPreview: rawText.slice(0, 1000) }, { status: 400 })
      }
    }
    const parsed = bodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation error', details: parsed.error.issues }, { status: 400 })
    }

    const { email } = parsed.data

    const existingActive = await prisma.user.findFirst({ where: { email, deletedAt: null } })
    if (existingActive) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 })
    }

    const existingDeleted = await prisma.user.findFirst({ where: { email, deletedAt: { not: null } } })
    const user = existingDeleted
      ? await prisma.user.update({ where: { email }, data: { deletedAt: null, name: existingDeleted.name || email.split('@')[0] } })
      : await prisma.user.create({ data: { email, name: email.split('@')[0] } })

    // create workspace and project for the new user
    const workspace = await prisma.workspace.create({ data: { name: `${user.name}'s Workspace`, slug: `ws-${Date.now()}`, ownerId: user.id } })
    await prisma.workspaceMember.create({ data: { workspaceId: workspace.id, userId: user.id, role: 'OWNER' } })
    await prisma.project.create({ data: { name: "Default Project", workspaceId: workspace.id } })

    return NextResponse.json({ ok: true, userId: user.id })
  } catch (err: unknown) {
    const e = err as Error
    return NextResponse.json({ error: 'Server error', message: String(e) }, { status: 500 })
  }
}
