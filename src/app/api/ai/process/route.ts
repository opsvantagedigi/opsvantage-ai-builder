import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Status } from "@prisma/client"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { createSanityClient } from "@/lib/sanity"

export async function POST() {
  // 1. Find the next pending AI task
  const task = await prisma.aiTask.findFirst({
    where: { status: Status.PENDING },
    include: { project: true }
  })

  if (!task) {
    return NextResponse.json({ message: "No pending tasks" })
  }

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

    // 5. Call Gemini
    const result = await model.generateContent(prompt)
    const output = result.response.text()

    // 6. Parse AI output
    const ai = JSON.parse(output)

    // 7. Push each page into Sanity
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

    // 8. Mark task as completed
    await prisma.aiTask.update({
      where: { id: task.id },
      data: {
        status: Status.COMPLETED,
        result: JSON.parse(output)
      }
    })

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error(err)

    await prisma.aiTask.update({
      where: { id: task.id },
      data: {
        status: Status.FAILED,
        error: err.message
      }
    })

    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
