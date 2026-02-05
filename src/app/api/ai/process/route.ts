import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Status } from "@prisma/client"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { createSanityClient } from "@/lib/sanity"
import { withErrorHandling } from "@/lib/api-error"
import { logger } from "@/lib/logger"
import { rateLimit } from "@/lib/rate-limit"

// Basic rate limiter: 10 requests per minute
const limiter = rateLimit({ interval: 60 * 1000, uniqueTokenPerInterval: 500 });

async function handler(req: Request) {
  // Rate Limiting Check
  try {
     // Use IP or specific header if available, fallback to global token for now
     const ip = req.headers.get("x-forwarded-for") || "global-ai-limit"; 
     await limiter.check(10, ip);
  } catch {
     return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  logger.info("Starting AI Task Processor");
  // 1. Find the next pending AI task
  const task = await prisma.aiTask.findFirst({
    where: { status: Status.PENDING },
    include: { project: true }
  })

  if (!task) {
    logger.info("No pending tasks found");
    return NextResponse.json({ message: "No pending tasks" })
  }

  logger.info({ msg: "Processing task", taskId: task.id, type: task.type });

  // 2. Mark task as PROCESSING
  await prisma.aiTask.update({
    where: { id: task.id },
    data: { status: Status.PROCESSING }
  })

  try {
    // 3. Prepare Gemini client
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    // 4. Build prompt
    const prompt = `
You are the AI engine for OpsVantage Digital.

Analyze the following onboarding data and generate a complete website structure.

Return ONLY valid JSON in this format:

{
  "pages": [
    {
      "title": "Home",
      "slug": "home",
      "sections": [
        {
          "_type": "heroSection",
          "headline": "...",
          "subheadline": "...",
          "variant": "glassmorphism"
        }
      ],
      "seo": {
        "metaTitle": "...",
        "metaDescription": "..."
      }
    }
  ]
}

Onboarding Data:
${JSON.stringify(task.payload, null, 2)}
`
    logger.debug("Prompt generated, calling Gemini");

    // 5. Call Gemini
    const result = await model.generateContent(prompt)
    const output = result.response.text()
    
    logger.debug("Gemini response received");

    // 6. Parse AI output
    // Clean up markdown blocks if present (common issue with LLMs)
    const jsonStr = output.replace(/```json\n?|\n?```/g, "").trim();
    const ai = JSON.parse(jsonStr)

    // 7. Push each page into Sanity
    if (task.project.sanityDataset) {
        const sanity = createSanityClient(task.project.sanityDataset!)
        for (const page of ai.pages) {
            await sanity.createOrReplace({
                _id: page.slug === "home" ? "home" : `page-${page.slug}`,
                _type: "page",
                title: page.title,
                slug: { current: page.slug },
                sections: page.sections,
                seo: page.seo || {}
            })
        }
    } else {
        logger.warn({ msg: "No Sanity Dataset configured for project", projectId: task.project.id });
    }

    // 8. Mark task as completed
    await prisma.aiTask.update({
      where: { id: task.id },
      data: {
        status: Status.COMPLETED,
        result: ai
      }
    })

    logger.info({ msg: "Task completed successfully", taskId: task.id });
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    logger.error({ msg: "Task processing failed", taskId: task.id, error: err.message });

    await prisma.aiTask.update({
      where: { id: task.id },
      data: {
        status: Status.FAILED,
        error: err.message
      }
    })
    
    // Re-throw to let the global handler also log it (or we could just return here)
    // But since we updated the DB status, we might want to return a cleaner error or rethrow.
    // The global handler will return a 500 response.
    throw err; 
  }
}

export const POST = withErrorHandling(handler);

    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
