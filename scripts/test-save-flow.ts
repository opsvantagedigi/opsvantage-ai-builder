import "dotenv/config"
import { prisma } from "@/lib/prisma"
import saveGeneratedPage from "@/lib/save-page"
import type { PageGenerationResponse } from "@/lib/page-generation-schema"

async function ensureTestUser(email: string) {
  let user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    user = await prisma.user.create({ data: { email, name: "Test User" } })
  }
  // ensure workspace and project
  const member = await prisma.workspaceMember.findFirst({ where: { userId: user.id } })
  if (!member) {
    const workspace = await prisma.workspace.create({ data: { name: "Test WS", slug: `test-ws-${Date.now()}`, ownerId: user.id } })
    await prisma.workspaceMember.create({ data: { workspaceId: workspace.id, userId: user.id, role: "OWNER" } })
    await prisma.project.create({ data: { name: "Test Project", workspaceId: workspace.id } })
  } else {
    const proj = await prisma.project.findFirst({ where: { workspaceId: member.workspaceId } })
    if (!proj) {
      await prisma.project.create({ data: { name: "Test Project", workspaceId: member.workspaceId } })
    }
  }
  return user
}

async function run() {
  const email = process.env.TEST_USER_EMAIL || "test+dev@example.com"
  const user = await ensureTestUser(email)

  const samplePage: PageGenerationResponse = {
    title: "Test Generated Page",
    metaDescription: "A page generated during automated test",
    slug: `test-generated-${Date.now()}`.replace(/[^a-z0-9-]/g, "").toLowerCase(),
    sections: [
      { id: "s1", type: "HERO", heading: "Welcome", body: "This is a hero section", cta: { label: "Get started" } },
      { id: "s2", type: "FEATURES", heading: "Features", items: [{ title: "Fast" }, { title: "Smart" }] }
    ]
  }

  try {
    const res = await saveGeneratedPage(user.email, samplePage)
    console.log("Saved page:", res)
  } catch (e) {
    console.error("Save flow failed:", e)
    process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
}

run()
