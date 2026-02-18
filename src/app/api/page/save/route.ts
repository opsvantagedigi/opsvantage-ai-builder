import { NextResponse } from "next/server"
import { verifySession } from "@/lib/verify-session"
import { prisma } from "@/lib/prisma"
import saveGeneratedPage from "@/lib/save-page"
import { withErrorHandling } from "@/lib/api-error"
import { logger } from "@/lib/logger"
import { pageGenerationResponseSchema } from "@/lib/page-generation-schema"

export const POST = withErrorHandling(async (req) => {
  const session = await verifySession()
  if (!session || !session?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const pagePayload = pageGenerationResponseSchema.parse(body.page)

  const user = await prisma.user.findFirst({ where: { email: session?.email, deletedAt: null } })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })
  const member = await prisma.workspaceMember.findFirst({ where: { userId: user.id } })
  if (!member) return NextResponse.json({ error: "No workspace found" }, { status: 404 })
  const project = await prisma.project.findFirst({ where: { workspaceId: member.workspaceId }, orderBy: { createdAt: "desc" } })
  if (!project) return NextResponse.json({ error: "No project found" }, { status: 404 })

  try {
    const result = await saveGeneratedPage(session?.email as string, pagePayload)
    return NextResponse.json({ ok: true, pageId: result.pageId, sanityId: result.sanityId })
    } catch (err: unknown) {
      const e = err as Error
      logger.error(`Failed to save generated page. Error: ${String(e)}`)
      return NextResponse.json({ error: "Failed to save page" }, { status: 500 })
  }
})
