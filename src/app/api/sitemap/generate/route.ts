import { NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { verifySession } from "@/lib/verify-session"
import { prisma } from "@/lib/prisma"
import { sitemapResponseSchema, SitemapResponse } from "@/lib/sitemap-schema"
import { GoogleGenerativeAI } from "@google/generative-ai"
// Avoid importing Prisma types in server code used by the editor; use `any` for json casts
import { withErrorHandling } from "@/lib/api-error"
import { logger } from "@/lib/logger"
import generateValidatedJSON from "@/lib/ai"

// Generates a simple sitemap JSON from onboarding data via Gemini
export const POST = withErrorHandling(async (req) => {
  // Lazily instantiate AI client to avoid import-time failures
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

  // Extra top-level guard so any unexpected errors at runtime still produce JSON
  // generate or propagate a request id to help correlate logs
  const requestId = req.headers.get("x-request-id") || randomUUID()

  try {
  const session = await verifySession()
  if (!session || !session?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await prisma.user.findFirst({ where: { email: session?.email, deletedAt: null } })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const member = await prisma.workspaceMember.findFirst({ where: { userId: user.id }, include: { workspace: true } })
  if (!member) return NextResponse.json({ error: "No workspace found" }, { status: 404 })

  const project = await prisma.project.findFirst({ where: { workspaceId: member.workspaceId }, orderBy: { createdAt: "desc" } })
  if (!project) return NextResponse.json({ error: "No project found" }, { status: 404 })

  const onboarding = await prisma.onboarding.findUnique({ where: { projectId: project.id } })
  if (!onboarding) return NextResponse.json({ error: "No onboarding found" }, { status: 404 })

  // Construct a clear prompt asking Gemini to return JSON with pages

  const prompt = `You are an expert SaaS website information architect. Given this onboarding data: ${JSON.stringify(
    onboarding
  )} generate a sitemap. Respond ONLY with valid JSON matching this schema: { "sitemap": [ { "id": "string", "title": "string", "slug": "kebab-case", "type": "HOME|ABOUT|SERVICES|CONTACT|BLOG|CUSTOM", "children": [] } ] }`;

  logger.info(`Sitemap generation prompt. Project ID: ${project.id}`)

  let validated: SitemapResponse
  try {
    validated = await generateValidatedJSON(genAI, prompt, sitemapResponseSchema, { maxAttempts: 3 })
  } catch (err: unknown) {
    const e = err as Error
    logger.error(`Sitemap generation failed. Error: ${String(e)}`)

    const fallback: SitemapResponse = {
      sitemap: [
        { id: "home", title: "Home", slug: "home", type: "HOME", children: [] },
        { id: "about", title: "About", slug: "about", type: "ABOUT", children: [] },
        { id: "services", title: "Services", slug: "services", type: "SERVICES", children: [] },
        { id: "pricing", title: "Pricing", slug: "pricing", type: "CUSTOM", children: [] },
        { id: "case-studies", title: "Case Studies", slug: "case-studies", type: "CUSTOM", children: [] },
        { id: "blog", title: "Blog", slug: "blog", type: "BLOG", children: [] },
        { id: "resources", title: "Resources", slug: "resources", type: "CUSTOM", children: [] },
        { id: "faq", title: "FAQ", slug: "faq", type: "CUSTOM", children: [] },
        { id: "contact", title: "Contact", slug: "contact", type: "CONTACT", children: [] },
        { id: "book-a-call", title: "Book a Call", slug: "book-a-call", type: "CUSTOM", children: [] },
      ],
    }

    const aiTask = await prisma.aiTask.create({
      data: {
        projectId: project.id,
        type: "ONBOARDING_TO_SITEMAP",
        provider: "GEMINI",
        payload: { onboardingId: onboarding.id, reason: "ai_failed" },
        result: fallback as unknown as any,
        status: "COMPLETED",
      },
    })

    return NextResponse.json({ ok: true, sitemap: fallback.sitemap, aiTaskId: aiTask.id, fallback: true })
  }

  // Persist an AiTask record for traceability
  const aiTask = await prisma.aiTask.create({
    data: {
      projectId: project.id,
      type: "ONBOARDING_TO_SITEMAP",
      provider: "GEMINI",
      payload: { onboardingId: onboarding.id },
      result: validated as unknown as any,
      status: "COMPLETED",
    }
  })

  logger.info(`Sitemap generated. Project ID: ${project.id}, AI Task ID: ${aiTask.id}`)
  return NextResponse.json({ ok: true, sitemap: validated.sitemap, aiTaskId: aiTask.id })
  } catch (err: unknown) {
    // Last-resort defensive JSON response with headers for debugging
    const headersToLog = {
      host: req.headers.get('host'),
      ua: req.headers.get('user-agent'),
      xRequestId: req.headers.get('x-request-id'),
      xForwardedFor: req.headers.get('x-forwarded-for')
    }
    logger.error(`Sitemap POST failed (unexpected). Error: ${String(err)}, Request ID: ${requestId}, Headers: ${JSON.stringify(headersToLog)}`)
    return NextResponse.json({ error: "Internal Server Error", message: String(err), requestId }, { status: 500 })
  }
})
