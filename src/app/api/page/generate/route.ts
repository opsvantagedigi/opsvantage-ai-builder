import { NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { withErrorHandling } from "@/lib/api-error"
import { logger } from "@/lib/logger"
import generateValidatedJSON from "@/lib/ai"
import { pageGenerationResponseSchema } from "@/lib/page-generation-schema"
import { logActivity } from "@/lib/audit-logger"

export const POST = withErrorHandling(async (req) => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")
  const requestId = req.headers.get("x-request-id") || randomUUID()

  let projectIdRef: string | null = null;
  let sitemapNodeRef: unknown = null;
  let userPromptRef: string | null = null;

  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const sitemapNode = body.sitemapNode
    const userPrompt = body.prompt || null

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })
    const member = await prisma.workspaceMember.findFirst({ where: { userId: user.id } })
    if (!member) return NextResponse.json({ error: "No workspace found" }, { status: 404 })

    // RBAC: Only EDITOR, ADMIN, or OWNER can generate pages
    if (member.role === 'VIEWER') {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }
    const project = await prisma.project.findFirst({ where: { workspaceId: member.workspaceId }, orderBy: { createdAt: "desc" } })
    if (!project) return NextResponse.json({ error: "No project found" }, { status: 404 })

    projectIdRef = project.id;
    sitemapNodeRef = sitemapNode ?? null;
    userPromptRef = userPrompt ?? null;

    let prompt = "Generate a website page JSON."
    if (sitemapNode) {
      prompt += `\nPage node: ${JSON.stringify(sitemapNode)}`
    }
    if (userPrompt) {
      prompt += `\nUser prompt: ${userPrompt}`
    }
    prompt += `\nRespond ONLY with valid JSON matching this schema: ${pageGenerationResponseSchema.toString()}`

    logger.info({ msg: "Page generation prompt", projectId: project.id, requestId })

    try {
      const validated = await generateValidatedJSON(genAI, prompt, pageGenerationResponseSchema, { model: "gemini-pro", maxAttempts: 3 })

      const aiTask = await prisma.aiTask.create({
        data: {
          projectId: projectIdRef!,
          type: "SITEMAP_TO_PAGES",
          provider: "GEMINI",
          payload: { sitemapNode: sitemapNodeRef as any, prompt: userPromptRef },
          result: validated,
          status: "COMPLETED",
        }
      })

      // Log the activity
      await logActivity({
        workspaceId: member.workspaceId,
        actorId: user.id,
        action: 'GENERATE_PAGE',
        entityType: 'AI_TASK',
        entityId: aiTask.id,
        metadata: { projectId: project.id, type: "PAGE" },
        ipAddress: req.headers.get('x-forwarded-for') || undefined,
        userAgent: req.headers.get('user-agent') || undefined,
      });

      return NextResponse.json({ ok: true, page: validated, aiTaskId: aiTask.id })
    } catch (err: unknown) {
      const e = err as Error
      logger.error({ msg: "Page generation failed", err: String(e), requestId })
      if (projectIdRef) {
        await prisma.aiTask.create({
          data: {
            projectId: projectIdRef,
            type: "SITEMAP_TO_PAGES",
            provider: "GEMINI",
            payload: { sitemapNode: sitemapNodeRef as any, prompt: userPromptRef },
            error: String(err),
            status: "FAILED",
          }
        })
      }
      return NextResponse.json({ error: "AI failed to generate page" }, { status: 500 })
    }
  } catch (err: unknown) {
    const ex = err as Error
    logger.error({ msg: "Page generation request failed", err: String(ex), requestId })
    return NextResponse.json({ error: "Page generation failed" }, { status: 500 })
  }
})
