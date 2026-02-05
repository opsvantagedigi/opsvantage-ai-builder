import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { withErrorHandling } from "@/lib/api-error"
import { logger } from "@/lib/logger"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

const SUGGESTION_PROMPTS: Record<string, (data: any) => string> = {
  businessName: () => `Suggest a catchy business name for a modern SaaS startup.`,
  businessType: () => `Suggest a business type for a digital-first company.`,
  industry: () => `Suggest an industry for a tech-forward business.`,
  description: (data) => `Write a short, engaging business description for a company named "${data.businessName || 'Acme'}" in the ${data.industry || 'technology'} industry.`,
  brandVoice: (data) => `Suggest a brand voice for a company targeting ${data.targetAudience || 'small business owners'} in the ${data.industry || 'technology'} industry.`,
  targetAudience: (data) => `Suggest a target audience for a ${data.businessType || 'SaaS'} business in the ${data.industry || 'technology'} industry.`,
  colorPalette: (data) => `Suggest a modern color palette (hex codes) for a ${data.designStyle || 'minimalist'} website in the ${data.industry || 'technology'} industry.`,
  designStyle: (data) => `Suggest a design style (e.g., modern, bold, luxury) for a ${data.businessType || 'SaaS'} company.`,
  goals: (data) => `Suggest a primary website goal for a ${data.businessType || 'SaaS'} company.`,
  competitors: (data) => `List 3 example competitors for a ${data.businessType || 'SaaS'} company in the ${data.industry || 'technology'} industry. Return as a comma-separated list of URLs.`,
}

export const POST = withErrorHandling(async (req) => {
  const session = await getServerSession(authOptions)
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { field, data } = await req.json()
  if (!field || !(field in SUGGESTION_PROMPTS)) {
    return NextResponse.json({ error: "Invalid field" }, { status: 400 })
  }
  const prompt = SUGGESTION_PROMPTS[field](data || {})
  logger.info({ msg: "Gemini suggestion prompt", field, prompt })
  const model = genAI.getGenerativeModel({ model: "gemini-pro" })
  const result = await model.generateContent(prompt)
  const suggestion = result.response.text().trim()
  logger.info({ msg: "Gemini suggestion result", field, suggestion })
  return NextResponse.json({ suggestion })
})
