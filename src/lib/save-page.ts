import { prisma } from "@/lib/prisma"
import { pageGenerationResponseSchema, PageGenerationResponse } from "@/lib/page-generation-schema"
import { logger } from "@/lib/logger"
import type { Prisma, SectionType } from '@prisma/client'

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
          type: sec.type as SectionType,
          variant: null,
          data: sec as unknown as Prisma.InputJsonValue,
        }
      })
    } catch (e) {
      logger.warn({ msg: "Failed to create section", err: String(e), section: sec })
    }
  }

  // Publish to Sanity (best-effort) — only if Sanity env is configured
  let sanityId: string | null = null
  if (process.env.NEXT_PUBLIC_SANITY_DATASET && process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    try {
      const { client: sanityClient } = await import("@/sanity/lib/client")
      const doc = {
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
  } else {
    logger.info({ msg: "Sanity not configured — skipping publish" })
  }

  return { pageId: created.id, sanityId }
}

export default saveGeneratedPage
