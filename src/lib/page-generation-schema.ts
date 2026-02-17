import { z } from "zod"

export const pageSectionSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["HERO", "FEATURES", "TESTIMONIALS", "CTA", "FAQ", "FOOTER", "CUSTOM"]),
  heading: z.string().optional(),
  body: z.string().optional(),
  cta: z.object({ label: z.string(), url: z.string().optional() }).optional(),
  image: z.string().url().optional(),
  items: z.array(z.object({ title: z.string().optional(), description: z.string().optional() })).optional(),
})

export const pageGenerationResponseSchema = z.object({
  title: z.string().min(1),
  metaDescription: z.string().optional(),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  sections: z.array(pageSectionSchema),
  seo: z
    .object({
      metaTitle: z.string(),
      metaDescription: z.string(),
      canonicalUrl: z.string().url(),
      keywords: z.array(z.string()),
      openGraph: z.object({
        title: z.string(),
        description: z.string(),
        type: z.literal("website"),
      }),
      structuredData: z.record(z.any()),
      preindexHints: z.object({
        robots: z.string(),
        priority: z.number(),
        changeFrequency: z.enum(["daily", "weekly", "monthly"]),
      }),
    })
    .optional(),
})

export type PageGenerationResponse = z.infer<typeof pageGenerationResponseSchema>
