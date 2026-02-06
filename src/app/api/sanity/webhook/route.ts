/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { logger } from "@/lib/logger"

export const POST = async (req: Request) => {
  const raw = await req.text()

  const signature = req.headers.get("sanity-signature") || req.headers.get("x-sanity-signature")
  const secret = process.env.SANITY_WEBHOOK_SECRET

  if (secret) {
    if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 401 })
    const crypto = await import("node:crypto")
    const expected = crypto.createHmac("sha256", secret).update(raw).digest("hex")
    try {
      const ok = crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
      if (!ok) return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    } catch (e) {
      return NextResponse.json({ error: "Invalid signature comparison" }, { status: 401 })
    }
  } else {
    logger.info({ msg: "SANITY_WEBHOOK_SECRET not set — skipping signature verification" })
  }

  let payload: any
  try {
    payload = JSON.parse(raw)
  } catch (e: unknown) {
    const ex = e as Error
    logger.warn({ msg: "Sanity webhook: invalid JSON", err: String(ex) })
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  // Sanity webhook payloads vary; support direct document or documents array
  const doc = payload._type ? payload : (Array.isArray(payload.documents) ? payload.documents[0] : payload.document || payload.result || null)
  if (!doc) {
    logger.info({ msg: "Sanity webhook: no document in payload" })
    return NextResponse.json({ ok: true })
  }

  const slug = doc.slug?.current || doc.slug
  const projectRef = doc.projectRef?._ref || doc.projectId || null

  // Determine path(s) to revalidate
  const pathsToRevalidate: string[] = []
  try {
    if (projectRef) {
      const project = await prisma.project.findUnique({ where: { id: projectRef } })
      const sub = project?.subdomain
      if (slug === "home" || doc.isHome) {
        if (sub) pathsToRevalidate.push(`/${sub}`)
      } else if (slug) {
        if (sub) pathsToRevalidate.push(`/${sub}/${slug}`)
        else pathsToRevalidate.push(`/${slug}`)
      }
    } else if (slug) {
      pathsToRevalidate.push(`/${slug}`)
    }

    // Always try to revalidate the slug path if present
    if (slug && !pathsToRevalidate.includes(`/${slug}`)) pathsToRevalidate.push(`/${slug}`)

    for (const p of pathsToRevalidate) {
      try {
        revalidatePath(p)
        logger.info({ msg: "Revalidated path", path: p })
      } catch (e) {
        logger.warn({ msg: "Failed to revalidate path", path: p, err: String(e) })
      }
    }
  } catch (e: unknown) {
    const ex = e as Error
    logger.error({ msg: "Error processing Sanity webhook", err: String(ex) })
    return NextResponse.json({ error: "Failed to process webhook", message: String(ex) }, { status: 500 })
  }

  return NextResponse.json({ ok: true, revalidated: pathsToRevalidate })
}
