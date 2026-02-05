import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { businessName, industry, goal } = body

  // 1. Find or create the user
  const user = await prisma.user.upsert({
    where: { email: session.user.email },
    update: {},
    create: {
      email: session.user.email,
      name: session.user.email.split("@")[0]
    }
  })

  // 2. Create a new Project for this user
  const project = await prisma.project.create({
    data: {
      name: businessName,
      owner: {
        connect: {
          id: user.id
        }
      },
      subdomain: `${businessName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`
    }
  })

  // Create a unique dataset name
  const datasetName = `dataset_${project.id}`

  // Call the dataset creation API
  await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/sanity/create-dataset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dataset: datasetName })
  })

  // Save dataset name to project
  await prisma.project.update({
    where: { id: project.id },
    data: { sanityDataset: datasetName }
  })

  // 3. Create an AI Task for website generation
  const aiTask = await prisma.aiTask.create({
    data: {
      projectId: project.id,
      type: "SITE_GEN",
      payload: {
        businessName,
        industry,
        goal
      }
    }
  })

  return NextResponse.json({
    ok: true,
    projectId: project.id,
    aiTaskId: aiTask.id
  })
}