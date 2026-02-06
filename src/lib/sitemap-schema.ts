import { z } from "zod"

/* eslint-disable @typescript-eslint/no-explicit-any */
export const sitemapPageSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    type: z.enum(["HOME", "ABOUT", "SERVICES", "CONTACT", "BLOG", "CUSTOM"]),
    children: z.array(sitemapPageSchema).optional().default([]),
  })
)

export const sitemapResponseSchema = z.object({
  sitemap: z.array(sitemapPageSchema),
})

export type SitemapPage = z.infer<typeof sitemapPageSchema>
export type SitemapResponse = z.infer<typeof sitemapResponseSchema>
