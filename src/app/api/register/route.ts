import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

export const POST = async (req: Request) => {
  try {
    const body = await req.json()
    const parsed = bodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation error', details: parsed.error.issues }, { status: 400 })
    }

    const { email } = parsed.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 })
    }

    const user = await prisma.user.create({ data: { email, name: email.split('@')[0] } })

    // create workspace and project for the new user
    const workspace = await prisma.workspace.create({ data: { name: `${user.name}'s Workspace`, slug: `ws-${Date.now()}`, ownerId: user.id } })
    await prisma.workspaceMember.create({ data: { workspaceId: workspace.id, userId: user.id, role: 'OWNER' } })
    await prisma.project.create({ data: { name: "Default Project", workspaceId: workspace.id } })

    return NextResponse.json({ ok: true, userId: user.id })
  } catch (err: any) {
    return NextResponse.json({ error: 'Server error', message: String(err) }, { status: 500 })
  }
}
