import { z } from "zod"

export const onboardingStep1Schema = z.object({
  businessName: z.string().min(2).max(100),
  businessType: z.string().min(2).max(50),
  industry: z.string().min(2).max(50),
  description: z.string().max(300).optional(),
})

export const onboardingStep2Schema = z.object({
  brandVoice: z.string().min(2).max(50),
  targetAudience: z.string().min(2).max(100),
})

export const onboardingStep3Schema = z.object({
  colorPalette: z.union([
    z.string().max(50), // preset name
    z.array(z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)).max(8) // hex codes
  ]),
  designStyle: z.string().min(2).max(50),
})

export const onboardingStep4Schema = z.object({
  goals: z.string().min(2).max(200),
  competitors: z.array(z.string().url()).max(10).optional(),
})

export const onboardingPatchSchema = onboardingStep1Schema.partial()
  .merge(onboardingStep2Schema.partial())
  .merge(onboardingStep3Schema.partial())
  .merge(onboardingStep4Schema.partial())

export const onboardingFullSchema = onboardingStep1Schema
  .merge(onboardingStep2Schema)
  .merge(onboardingStep3Schema)
  .merge(onboardingStep4Schema)
