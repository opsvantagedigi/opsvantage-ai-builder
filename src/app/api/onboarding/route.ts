import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { onboardingStep1Schema, onboardingPatchSchema } from "@/lib/onboarding-schema"
import { withErrorHandling } from "@/lib/api-error"
import { logger } from "@/lib/logger"
import { checkSubscription } from "@/lib/subscription"

// GET: Fetch onboarding state for current user (latest project)
export const GET = withErrorHandling(async () => {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.email) {
      logger.error({ msg: "Onboarding GET: Unauthorized", session })
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    logger.info({ msg: "Onboarding GET: session", email: session.user.email })
    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) {
      logger.error({ msg: "Onboarding GET: User not found", email: session.user.email })
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    const member = await prisma.workspaceMember.findFirst({ where: { userId: user.id }, include: { workspace: true } })
    if (!member) {
      logger.error({ msg: "Onboarding GET: No workspace found", userId: user.id })
      return NextResponse.json({ error: "No workspace found" }, { status: 404 })
    }
    const project = await prisma.project.findFirst({ where: { workspaceId: member.workspaceId }, orderBy: { createdAt: "desc" } })
    if (!project) {
      logger.error({ msg: "Onboarding GET: No project found", workspaceId: member.workspaceId })
      return NextResponse.json({ error: "No project found" }, { status: 404 })
    }
    const onboarding = await prisma.onboarding.findUnique({ where: { projectId: project.id } })
    logger.info({ msg: "Onboarding GET: Success", projectId: project.id, onboardingId: onboarding?.id })
    return NextResponse.json({ onboarding, projectId: project.id })
  } catch (err) {
    logger.error({ msg: "Onboarding GET: Exception", err: String(err) })
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
})

// POST: Create onboarding record (step 1)
export const POST = withErrorHandling(async (req) => {
  const session = await getServerSession(authOptions)
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const body = await req.json()
  const step1 = onboardingStep1Schema.safeParse(body)
  if (!step1.success) {
    return NextResponse.json({ error: "Validation Error", details: step1.error.issues }, { status: 400 })
  }
  const { businessName, businessType, industry, description } = step1.data
  // Find or create user
  const user = await prisma.user.upsert({
    where: { email: session.user.email },
    update: {},
    create: { email: session.user.email, name: session.user.email.split("@")[0] }
  })
  // Find or create workspace
  const member = await prisma.workspaceMember.findFirst({ where: { userId: user.id }, include: { workspace: true } })
  let workspaceId = member?.workspaceId
  if (!workspaceId) {
    const safeName = (user.name || 'user').toLowerCase().replace(/[^a-z0-9]/g, '-')
    const newWorkspace = await prisma.workspace.create({
      data: {
        name: `${user.name || 'User'}'s Workspace`,
        slug: `${safeName}-${Date.now()}`,
        ownerId: user.id,
        members: { create: { userId: user.id, role: "OWNER" } }
      }
    })
    workspaceId = newWorkspace.id
  } else {
    // If workspace exists, check project limit before creating a new one
    const subscription = await checkSubscription(workspaceId);
    if (subscription.usage.projects >= subscription.limits.projects) {
      return NextResponse.json(
        {
          error: `You have reached the project limit for the ${subscription.plan} plan.`,
        },
        { status: 403 }
      );
    }
  }
  // Create new project for onboarding (one per onboarding flow)
  const project = await prisma.project.create({
    data: {
      name: businessName,
      workspace: { connect: { id: workspaceId } },
      subdomain: `${businessName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`
    }
  })
  // Create unique dataset name
  const datasetName = `dataset_${project.id}`
  await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/sanity/create-dataset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dataset: datasetName })
  })
  await prisma.project.update({ where: { id: project.id }, data: { sanityDataset: datasetName } })
  // Create onboarding record (step 1)
  const onboarding = await prisma.onboarding.create({
    data: {
      projectId: project.id,
      businessName,
      businessType,
      industry,
      description,
      status: "DRAFT"
    }
  })
  logger.info({ msg: "Onboarding created", onboardingId: onboarding.id, projectId: project.id })
  return NextResponse.json({ ok: true, onboardingId: onboarding.id, projectId: project.id })
})

// PATCH: Update onboarding fields step-by-step
export const PATCH = withErrorHandling(async (req) => {
  const session = await getServerSession(authOptions)
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const body = await req.json()
  // Validate all possible fields
  const patch = onboardingPatchSchema.safeParse(body)
  if (!patch.success) {
    return NextResponse.json({ error: "Validation Error", details: patch.error.issues }, { status: 400 })
  }
  // Find latest onboarding for user's latest project
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })
  const member = await prisma.workspaceMember.findFirst({ where: { userId: user.id }, include: { workspace: true } })
  if (!member) return NextResponse.json({ error: "No workspace found" }, { status: 404 })
  const project = await prisma.project.findFirst({ where: { workspaceId: member.workspaceId }, orderBy: { createdAt: "desc" } })
  if (!project) return NextResponse.json({ error: "No project found" }, { status: 404 })
  const onboarding = await prisma.onboarding.findUnique({ where: { projectId: project.id } })
  if (!onboarding) return NextResponse.json({ error: "No onboarding found" }, { status: 404 })
  // Update onboarding record
  await prisma.onboarding.update({
    where: { id: onboarding.id },
    data: { ...patch.data },
  })
  logger.info({ msg: "Onboarding updated", onboardingId: onboarding.id, fields: Object.keys(patch.data) })
  return NextResponse.json({ ok: true, onboardingId: onboarding.id })
})