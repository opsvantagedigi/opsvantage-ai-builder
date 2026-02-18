import { NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { verifySession } from "@/lib/verify-session"
import { prisma } from "@/lib/prisma"
// Avoid importing Prisma types in this file; use `any` for runtime JSON casts
import { GoogleGenerativeAI } from "@google/generative-ai"
import { withErrorHandling } from "@/lib/api-error"
import { logger } from "@/lib/logger"
import generateValidatedJSON from "@/lib/ai"
import { pageGenerationResponseSchema } from "@/lib/page-generation-schema"
import { optimizeGeneratedPageSeo } from "@/lib/ai/seo-optimization-engine"

export const POST = withErrorHandling(async (req) => {
  // Lazily instantiate AI client to avoid import-time failures
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

  // Defensive top-level guard for unexpected runtime errors
  const requestId = req.headers.get("x-request-id") || randomUUID()

  let projectIdRef: string | null = null;
  let sitemapNodeRef: unknown = null;
  let userPromptRef: string | null = null;

  try {
  const session = await verifySession()
  if (!session || !session?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  // Accept either a sitemapNode or a freeform prompt
  const sitemapNode = body.sitemapNode
  const userPrompt = body.prompt || null

  // Find project context
  const user = await prisma.user.findFirst({ where: { email: session?.email, deletedAt: null } })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })
  const member = await prisma.workspaceMember.findFirst({ where: { userId: user.id } })
  if (!member) return NextResponse.json({ error: "No workspace found" }, { status: 404 })
  const project = await prisma.project.findFirst({ where: { workspaceId: member.workspaceId }, orderBy: { createdAt: "desc" } })
  if (!project) return NextResponse.json({ error: "No project found" }, { status: 404 })
  // capture refs for use in outer error handlers
  projectIdRef = project.id;
  sitemapNodeRef = sitemapNode ?? null;
  userPromptRef = userPrompt ?? null;

  const onboarding = await prisma.onboarding.findUnique({ where: { projectId: project.id } })

  // Build prompt
  let prompt = "Generate a website page JSON."
  if (sitemapNode) {
    prompt += `\nPage node: ${JSON.stringify(sitemapNode)}`
  }
  if (userPrompt) {
    prompt += `\nUser prompt: ${userPrompt}`
  }
  prompt += `\nAlso include SEO intent in the copy so the page is index-ready.`
  prompt += `\nRespond ONLY with valid JSON matching this schema: ${pageGenerationResponseSchema.toString()}`

  logger.info(`Page generation prompt. Project ID: ${project.id}`)

  try {
    const validated = await generateValidatedJSON(genAI, prompt, pageGenerationResponseSchema, { model: "gemini-pro", maxAttempts: 3 })
    const optimizedPage = optimizeGeneratedPageSeo({
      page: validated,
      onboarding: {
        businessName: onboarding?.businessName ?? undefined,
        businessType: onboarding?.businessType ?? undefined,
        industry: onboarding?.industry ?? undefined,
        description: onboarding?.description ?? undefined,
        brandVoice: onboarding?.brandVoice ?? undefined,
        targetAudience: onboarding?.targetAudience ?? undefined,
        goals: onboarding?.goals ?? undefined,
      },
      siteUrl: process.env.NEXT_PUBLIC_APP_URL,
    })

    // Persist AiTask
    const aiTask = await prisma.aiTask.create({
      data: {
        projectId: projectIdRef!,
        type: "SITEMAP_TO_PAGES",
        provider: "GEMINI",
        payload: { sitemapNode: sitemapNodeRef as any, prompt: userPromptRef },
        result: optimizedPage as any,
        status: "COMPLETED",
      }
    })

    return NextResponse.json({ ok: true, page: optimizedPage, aiTaskId: aiTask.id })
  } catch (err: unknown) {
    const e = err as Error
    logger.error(`Page generation failed. Error: ${String(e)}`)
    // Persist failed AiTask
    try {
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
    } catch (e: unknown) {
      const ee = e as Error
      logger.warn(`Failed to persist failed AiTask. Error: ${String(ee)}`)
    }

    return NextResponse.json({ error: "AI failed to generate page" }, { status: 500 })
  }
  } catch (err: unknown) {
    const ex = err as Error
    logger.error(`Page generation failed. Error: ${String(ex)}`)
    // Persist failed AiTask
    try {
        if (projectIdRef) {
        await prisma.aiTask.create({
          data: {
            projectId: projectIdRef,
            type: "SITEMAP_TO_PAGES",
            provider: "GEMINI",
            payload: { sitemapNode: sitemapNodeRef as any, prompt: userPromptRef },
            error: String(ex),
            status: "FAILED",
          }
        })
      }
    } catch (e: unknown) {
      // swallow persistence error
    }
    return NextResponse.json({ error: "Page generation failed" }, { status: 500 })
  }
  })
