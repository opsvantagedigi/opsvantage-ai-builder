import { z } from "zod"

export interface SitemapPage {
  id: string
  title: string
  slug: string
  type: "HOME" | "ABOUT" | "SERVICES" | "CONTACT" | "BLOG" | "CUSTOM"
  children?: SitemapPage[]
}

// typed lazy schema for sitemap pages
export const sitemapPageSchema: z.ZodType<SitemapPage> = z.lazy(() =>
  z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    type: z.enum(["HOME", "ABOUT", "SERVICES", "CONTACT", "BLOG", "CUSTOM"]),
    children: z.array(sitemapPageSchema).optional().default([]),
  }) as unknown as z.ZodType<SitemapPage>
)

export const sitemapResponseSchema = z.object({
  sitemap: z.array(sitemapPageSchema),
})

export type SitemapResponse = z.infer<typeof sitemapResponseSchema>
