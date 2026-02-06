import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { withErrorHandling } from "@/lib/api-error"
import { logger } from "@/lib/logger"
import { z } from "zod"
import generateValidatedJSON from "@/lib/ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

const SUGGESTION_PROMPTS: Record<string, (data: unknown) => string> = {
  businessName: () => `Suggest a catchy business name for a modern SaaS startup.`,
  businessType: () => `Suggest a business type for a digital-first company.`,
  industry: () => `Suggest an industry for a tech-forward business.`,
  description: (data) => `Write a short, engaging business description for a company named "${(data as Record<string, unknown>).businessName || 'Acme'}" in the ${(data as Record<string, unknown>).industry || 'technology'} industry.`,
  brandVoice: (data) => `Suggest a brand voice for a company targeting ${(data as Record<string, unknown>).targetAudience || 'small business owners'} in the ${(data as Record<string, unknown>).industry || 'technology'} industry.`,
  targetAudience: (data) => `Suggest a target audience for a ${(data as Record<string, unknown>).businessType || 'SaaS'} business in the ${(data as Record<string, unknown>).industry || 'technology'} industry.`,
  colorPalette: (data) => `Suggest a modern color palette (hex codes) for a ${(data as Record<string, unknown>).designStyle || 'minimalist'} website in the ${(data as Record<string, unknown>).industry || 'technology'} industry.`,
  designStyle: (data) => `Suggest a design style (e.g., modern, bold, luxury) for a ${(data as Record<string, unknown>).businessType || 'SaaS'} company.`,
  goals: (data) => `Suggest a primary website goal for a ${(data as Record<string, unknown>).businessType || 'SaaS'} company.`,
  competitors: (data) => `List 3 example competitors for a ${(data as Record<string, unknown>).businessType || 'SaaS'} company in the ${(data as Record<string, unknown>).industry || 'technology'} industry. Return as a comma-separated list of URLs.`,
}

const suggestionResponseSchema = z.object({ suggestion: z.string().min(1) })

export const POST = withErrorHandling(async (req) => {
  const session = await getServerSession(authOptions)
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { field, data } = await req.json()
  if (!field || !(field in SUGGESTION_PROMPTS)) {
    return NextResponse.json({ error: "Invalid field" }, { status: 400 })
  }
  // Instruct model to return JSON { "suggestion": "..." }
  const basePrompt = SUGGESTION_PROMPTS[field](data || {})
  const prompt = `${basePrompt}\n\nRespond only with valid JSON in this shape: { "suggestion": "string" }`
  logger.info({ msg: "Gemini suggestion prompt", field, prompt })

  try {
    const validated = await generateValidatedJSON(genAI, prompt, suggestionResponseSchema, { model: "gemini-pro", maxAttempts: 3 })
    logger.info({ msg: "Gemini suggestion result", field, suggestion: validated.suggestion })
    return NextResponse.json({ suggestion: validated.suggestion })
  } catch (err: unknown) {
    logger.error({ msg: "Gemini suggestion failed", field, err: String(err) })
    return NextResponse.json({ error: "AI suggestion failed" }, { status: 500 })
  }
})
