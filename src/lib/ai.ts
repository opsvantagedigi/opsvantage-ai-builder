import { GoogleGenerativeAI } from "@google/generative-ai"
import { z } from "zod"
import { logger } from "@/lib/logger"

type GenerateOptions = {
  model?: string
  maxAttempts?: number
  attemptDelayMs?: number
}

export async function generateValidatedJSON<T extends z.ZodTypeAny>(
  genAI: GoogleGenerativeAI,
  prompt: string,
  schema: T,
  options: GenerateOptions = {}
): Promise<z.infer<T>> {
  const modelName = options.model || process.env.GEMINI_MODEL_NAME || "gemini-1.5-flash"
  const maxAttempts = options.maxAttempts ?? 3
  const attemptDelay = options.attemptDelayMs ?? 400

  let lastRaw = ""
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    logger.info(`AI generation attempt: ${JSON.stringify({ attempt, model: modelName })}`)
    const model = genAI.getGenerativeModel({ model: modelName })
    const result = await model.generateContent(prompt)
    const raw = result.response.text().trim()
    lastRaw = raw

    // Try to parse JSON
    let parsed: unknown = null
    try {
      parsed = JSON.parse(raw)
    } catch (e) {
      logger.warn(`AI returned non-JSON; will attempt repair: ${JSON.stringify({ attempt, raw })}`)
      // fall through to retry with repair prompt
    }

    if (parsed) {
      const validated = schema.safeParse(parsed)
      if (validated.success) {
        return validated.data
      }
      logger.warn(`AI JSON did not validate against schema: ${JSON.stringify({ attempt, issues: validated.error.issues })}`)
    }

    // If we have more attempts left, ask the model to return only valid JSON following the schema
    if (attempt < maxAttempts) {
      const repairPrompt = `The previous response could not be parsed/validated as the required JSON schema. Please respond ONLY with valid JSON that matches this schema. Previous output:\n${raw}\n\nRequired schema: ${schema.toString()}\n\nNow return only valid JSON.`
      // small delay/backoff
      await new Promise((r) => setTimeout(r, attemptDelay * attempt))
      // set prompt to repairPrompt for next iteration
      prompt = repairPrompt
      continue
    }
  }

  logger.error(`AI failed to produce valid JSON after attempts: ${JSON.stringify({ lastRaw })}`)
  throw new Error("AI failed to produce valid JSON output")
}

export default generateValidatedJSON
