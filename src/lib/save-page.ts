import { prisma } from "@/lib/prisma"
import { pageGenerationResponseSchema, PageGenerationResponse } from "@/lib/page-generation-schema"
import { client as sanityClient } from "@/sanity/lib/client"
import { logger } from "@/lib/logger"

export async function saveGeneratedPage(userEmail: string, pagePayload: PageGenerationResponse) {
  // validate
  const payload = pageGenerationResponseSchema.parse(pagePayload)

  const user = await prisma.user.findUnique({ where: { email: userEmail } })
  if (!user) throw new Error("User not found")
  const member = await prisma.workspaceMember.findFirst({ where: { userId: user.id } })
  if (!member) throw new Error("No workspace found for user")
  const project = await prisma.project.findFirst({ where: { workspaceId: member.workspaceId }, orderBy: { createdAt: "desc" } })
  if (!project) throw new Error("No project found for workspace")

  const created = await prisma.page.create({
    data: {
      projectId: project.id,
      title: payload.title,
      slug: payload.slug,
    }
  })

  for (const sec of payload.sections) {
    try {
      await prisma.section.create({
        data: {
          pageId: created.id,
          type: sec.type as any,
          variant: null,
          data: sec as any,
        }
      })
    } catch (e) {
      logger.warn({ msg: "Failed to create section", err: String(e), section: sec })
    }
  }

  // Publish to Sanity (best-effort)
  let sanityId: string | null = null
  try {
    const doc: any = {
      _type: "page",
      title: payload.title,
      slug: { _type: "slug", current: payload.slug },
      sections: payload.sections.map((s) => ({ _type: "section", ...s })),
      projectRef: { _type: "reference", _ref: project.id },
    }
    const res = await sanityClient.create(doc)
    sanityId = res?._id || null
  } catch (e) {
    logger.warn({ msg: "Sanity publish failed", err: String(e) })
  }

  return { pageId: created.id, sanityId }
}

export default saveGeneratedPage
