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

  // 2. Find or create a Workspace for the user (since Project now belongs to Workspace)
  const existingMember = await prisma.workspaceMember.findFirst({
    where: { userId: user.id },
    include: { workspace: true }
  });
  
  let workspaceId = existingMember?.workspaceId;
  
  if (!workspaceId) {
     const safeName = (user.name || 'user').toLowerCase().replace(/[^a-z0-9]/g, '-');
     const newWorkspace = await prisma.workspace.create({
        data: {
            name: `${user.name || 'User'}'s Workspace`,
            slug: `${safeName}-${Date.now()}`,
            ownerId: user.id,
            members: {
                create: { userId: user.id, role: "OWNER" }
            }
        }
     });
     workspaceId = newWorkspace.id;
  }

  // 3. Create a new Project for this workspace
  const project = await prisma.project.create({
    data: {
      name: businessName,
      workspace: {
        connect: {
            id: workspaceId
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
      type: "ONBOARDING_TO_SITEMAP",
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