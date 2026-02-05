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
})

export type PageGenerationResponse = z.infer<typeof pageGenerationResponseSchema>
