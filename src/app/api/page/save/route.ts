import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import saveGeneratedPage from "@/lib/save-page"
import { withErrorHandling } from "@/lib/api-error"
import { logger } from "@/lib/logger"
import { pageGenerationResponseSchema } from "@/lib/page-generation-schema"
import { logActivity } from "@/lib/audit-logger"

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

  // RBAC: Only EDITOR, ADMIN, or OWNER can save pages
  if (member.role === 'VIEWER') {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
  }
  const project = await prisma.project.findFirst({ where: { workspaceId: member.workspaceId }, orderBy: { createdAt: "desc" } })
  if (!project) return NextResponse.json({ error: "No project found" }, { status: 404 })

  try {
    const result = await saveGeneratedPage(session.user.email as string, pagePayload)

    // Log the activity
    await logActivity({
      workspaceId: member.workspaceId,
      actorId: user.id,
      action: 'SAVE_PAGE',
      entityType: 'PAGE',
      entityId: result.pageId,
      metadata: { slug: pagePayload.slug, title: pagePayload.title },
      ipAddress: req.headers.get('x-forwarded-for') || undefined,
      userAgent: req.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({ ok: true, pageId: result.pageId, sanityId: result.sanityId })
  } catch (err: unknown) {
    const e = err as Error
    logger.error({ msg: "Failed to save generated page", err: String(e) })
    return NextResponse.json({ error: "Failed to save page" }, { status: 500 })
  }
})
