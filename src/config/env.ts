import { z } from "zod";

const truthy = z
  .string()
  .transform((value) => value.trim().toLowerCase())
  .refine((value) => value === "true" || value === "1" || value === "yes" || value === "on", {
    message: "Expected a truthy value",
  });

const maybeUrl = z.string().trim().url();

function isBuildPhase() {
  return (
    process.env.NEXT_PHASE === "phase-production-build" ||
    process.env.SKIP_DB_CHECK_DURING_BUILD === "true" ||
    process.env.CI === "true"
  );
}

const baseSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  NEXTAUTH_SECRET: z.string().trim().min(1).optional(),
  NEXTAUTH_URL: maybeUrl.optional(),
  ADMIN_EMAILS: z.string().trim().optional(),

  DATABASE_URL: z.string().trim().min(1).optional(),
  DATABASE_URL_FALLBACK: z.string().trim().min(1).optional(),

  MASTER_KEY: z.string().trim().min(1).optional(),
  SOVEREIGN_PASSWORD: z.string().trim().min(1).optional(),
  ADMIN_BYPASS_PASSWORD: z.string().trim().min(1).optional(),

  GEMINI_API_KEY: z.string().trim().min(1).optional(),
  GEMINI_MODEL_NAME: z.string().trim().optional(),
  TAVILY_API_KEY: z.string().trim().optional(),

  STRIPE_SECRET_KEY: z.string().trim().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().trim().optional(),

  UPSTASH_REDIS_REST_URL: maybeUrl.optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().trim().optional(),

  OPENPROVIDER_USERNAME: z.string().trim().optional(),
  OPENPROVIDER_PASSWORD: z.string().trim().optional(),
  OPENPROVIDER_URL: maybeUrl.optional(),

  SANITY_WRITE_TOKEN: z.string().trim().optional(),
  SANITY_WEBHOOK_SECRET: z.string().trim().optional(),

  PUSH_SERVICE_TOKEN: z.string().trim().optional(),
  VAPID_PRIVATE_KEY: z.string().trim().optional(),
  VAPID_SUBJECT: z.string().trim().optional(),

  NEXT_PUBLIC_APP_URL: maybeUrl.optional(),
  NEXT_PUBLIC_BASE_URL: maybeUrl.optional(),
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().trim().optional(),
  NEXT_PUBLIC_NEURAL_CORE_URL: maybeUrl.optional(),
  NEXT_PUBLIC_NEURAL_CORE_WS_URL: z.string().trim().optional(),
  NEXT_PUBLIC_MARZ_VIDEO_MODE: z.string().trim().optional(),
  NEXT_PUBLIC_PRICING_MARKUP: z.string().trim().optional(),
  NEXT_PUBLIC_LAUNCH_MODE: z.string().trim().optional(),
  NEXT_PUBLIC_NEURAL_LINK_ENDPOINT: z.string().trim().optional(),

  NEXT_PUBLIC_SANITY_PROJECT_ID: z.string().trim().optional(),
  NEXT_PUBLIC_SANITY_DATASET: z.string().trim().optional(),
  NEXT_PUBLIC_SANITY_API_VERSION: z.string().trim().optional(),

  NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER: z.string().trim().optional(),
  NEXT_PUBLIC_STRIPE_PRICE_ID_PRO: z.string().trim().optional(),
  NEXT_PUBLIC_STRIPE_PRICE_ID_AGENCY: z.string().trim().optional(),

  CLAIMS_SALT: z.string().trim().optional(),
  LOG_LEVEL: z.string().trim().optional(),
  GCP_PROJECT_ID: z.string().trim().optional(),
  GOOGLE_CLOUD_PROJECT: z.string().trim().optional(),
});

function requireInProductionRuntime<T extends z.ZodTypeAny>(schema: T) {
  const buildPhase = isBuildPhase();
  if (buildPhase) {
    return schema.optional();
  }
  return schema;
}

const productionRequired = z.object({
  NEXTAUTH_SECRET: requireInProductionRuntime(z.string().trim().min(1)),
  DATABASE_URL: requireInProductionRuntime(z.string().trim().min(1)),
  UPSTASH_REDIS_REST_URL: requireInProductionRuntime(maybeUrl),
  UPSTASH_REDIS_REST_TOKEN: requireInProductionRuntime(z.string().trim().min(1)),
  OPENPROVIDER_USERNAME: requireInProductionRuntime(z.string().trim().min(1)),
  OPENPROVIDER_PASSWORD: requireInProductionRuntime(z.string().trim().min(1)),
  GEMINI_API_KEY: requireInProductionRuntime(z.string().trim().min(1)),
});

const schema = baseSchema.merge(productionRequired);

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const message = parsed.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("\n");

  if (process.env.NODE_ENV === "production" && !isBuildPhase()) {
    throw new Error(`CRITICAL: Invalid environment configuration\n${message}`);
  }
}

export const env = parsed.success ? parsed.data : (process.env as unknown as z.infer<typeof schema>);
