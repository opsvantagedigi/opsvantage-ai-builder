import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { withErrorHandling } from "@/lib/api-error"
import { logger } from "@/lib/logger"
import generateValidatedJSON from "@/lib/ai"
import { pageGenerationResponseSchema } from "@/lib/page-generation-schema"

export const POST = withErrorHandling(async (req) => {
  // Lazily instantiate AI client to avoid import-time failures
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

  // Defensive top-level guard for unexpected runtime errors
  try {
  const session = await getServerSession(authOptions)
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  // Accept either a sitemapNode or a freeform prompt
  const sitemapNode = body.sitemapNode
  const userPrompt = body.prompt || null

  // Find project context
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })
  const member = await prisma.workspaceMember.findFirst({ where: { userId: user.id } })
  if (!member) return NextResponse.json({ error: "No workspace found" }, { status: 404 })
  const project = await prisma.project.findFirst({ where: { workspaceId: member.workspaceId }, orderBy: { createdAt: "desc" } })
  if (!project) return NextResponse.json({ error: "No project found" }, { status: 404 })

  // Build prompt
  let prompt = "Generate a website page JSON."
  if (sitemapNode) {
    prompt += `\nPage node: ${JSON.stringify(sitemapNode)}`
  }
  if (userPrompt) {
    prompt += `\nUser prompt: ${userPrompt}`
  }
  prompt += `\nRespond ONLY with valid JSON matching this schema: ${pageGenerationResponseSchema.toString()}`

  logger.info({ msg: "Page generation prompt", projectId: project.id })

  try {
    const validated = await generateValidatedJSON(genAI, prompt, pageGenerationResponseSchema, { model: "gemini-pro", maxAttempts: 3 })

    // Persist AiTask
    const aiTask = await prisma.aiTask.create({
      data: {
        projectId: project.id,
        type: "SITEMAP_TO_PAGES",
        provider: "GEMINI",
        payload: { sitemapNode: sitemapNode ?? null, prompt: userPrompt ?? null },
        result: validated,
        status: "COMPLETED",
      }
    })

    return NextResponse.json({ ok: true, page: validated, aiTaskId: aiTask.id })
  } catch (err: any) {
    logger.error({ msg: "Page generation failed", err: String(err) })
    // Persist failed AiTask
    try {
      await prisma.aiTask.create({
        data: {
          projectId: project.id,
          type: "SITEMAP_TO_PAGES",
          provider: "GEMINI",
          payload: { sitemapNode: sitemapNode ?? null, prompt: userPrompt ?? null },
          error: String(err),
          status: "FAILED",
        }
      })
    } catch (e) {
      logger.warn({ msg: "Failed to persist failed AiTask", err: String(e) })
    }

    return NextResponse.json({ error: "AI failed to generate page" }, { status: 500 })
  }
  } catch (err: unknown) {
    logger.error({ msg: "Page POST failed (unexpected)", err: String(err) })
    return NextResponse.json({ error: "Internal Server Error", message: String(err) }, { status: 500 })
  }
})
