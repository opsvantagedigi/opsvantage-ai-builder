import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { withErrorHandling } from "@/lib/api-error"
import { logger } from "@/lib/logger"
import { pageGenerationResponseSchema } from "@/lib/page-generation-schema"

export const POST = withErrorHandling(async (req) => {
  const session = await getServerSession(authOptions)
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const pagePayload = pageGenerationResponseSchema.parse(body.page)

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })
  const member = await prisma.workspaceMember.findFirst({ where: { userId: user.id } })
  if (!member) return NextResponse.json({ error: "No workspace found" }, { status: 404 })
  const project = await prisma.project.findFirst({ where: { workspaceId: member.workspaceId }, orderBy: { createdAt: "desc" } })
  if (!project) return NextResponse.json({ error: "No project found" }, { status: 404 })

  // Create Page
  const created = await prisma.page.create({
    data: {
      projectId: project.id,
      title: pagePayload.title,
      slug: pagePayload.slug,
    }
  })

  // Create sections
  for (const sec of pagePayload.sections) {
    try {
      await prisma.section.create({
        data: {
          pageId: created.id,
          type: sec.type as any,
          variant: null,
          data: sec as any,
        }
      })
    } catch (e) {
      logger.warn({ msg: "Failed to create section", err: String(e), section: sec })
    }
  }

  return NextResponse.json({ ok: true, pageId: created.id })
})
