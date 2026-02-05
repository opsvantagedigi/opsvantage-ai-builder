import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sitemapResponseSchema } from "@/lib/sitemap-schema"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { withErrorHandling } from "@/lib/api-error"
import { logger } from "@/lib/logger"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

// Generates a simple sitemap JSON from onboarding data via Gemini
export const POST = withErrorHandling(async (req) => {
  const session = await getServerSession(authOptions)
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const member = await prisma.workspaceMember.findFirst({ where: { userId: user.id }, include: { workspace: true } })
  if (!member) return NextResponse.json({ error: "No workspace found" }, { status: 404 })

  const project = await prisma.project.findFirst({ where: { workspaceId: member.workspaceId }, orderBy: { createdAt: "desc" } })
  if (!project) return NextResponse.json({ error: "No project found" }, { status: 404 })

  const onboarding = await prisma.onboarding.findUnique({ where: { projectId: project.id } })
  if (!onboarding) return NextResponse.json({ error: "No onboarding found" }, { status: 404 })

  // Construct a clear prompt asking Gemini to return JSON with pages
  const prompt = `Generate a sitemap JSON for a website based on the following onboarding information. Return ONLY valid JSON with a top-level "pages" array. Each page must have: title, slug, type (HOME|LANDING|CUSTOM), and priority (1-10). Onboarding: ${JSON.stringify(onboarding)}\n\nExample output: { "pages": [ { "title":"Home","slug":"/","type":"HOME","priority":10 } ] }`;

  logger.info({ msg: "Sitemap generation prompt", projectId: project.id })

  const model = genAI.getGenerativeModel({ model: "gemini-pro" })
  const result = await model.generateContent(prompt)
  const raw = result.response.text().trim()

  let parsed: any = null
  try {
    parsed = JSON.parse(raw)
  } catch (e) {
    logger.error({ msg: "Failed to parse sitemap JSON from Gemini", raw, err: String(e) })
    return NextResponse.json({ error: "Failed to parse sitemap from AI" }, { status: 500 })
  }

  const validated = sitemapResponseSchema.safeParse(parsed)
  if (!validated.success) {
    logger.error({ msg: "Sitemap validation failed", issues: validated.error.issues, raw })
    return NextResponse.json({ error: "AI returned invalid sitemap format" }, { status: 500 })
  }

  // Persist an AiTask record for traceability
  const aiTask = await prisma.aiTask.create({
    data: {
      projectId: project.id,
      type: "ONBOARDING_TO_SITEMAP",
      provider: "GEMINI",
      payload: { onboardingId: onboarding.id },
      result: validated.data,
      status: "COMPLETED",
    }
  })

  logger.info({ msg: "Sitemap generated", projectId: project.id, aiTaskId: aiTask.id })
  return NextResponse.json({ ok: true, sitemap: validated.data.sitemap, aiTaskId: aiTask.id })
})
