import { env } from "@/config/env";

 
console.log(
  JSON.stringify(
    {
      ok: true,
      nodeEnv: env.NODE_ENV,
      buildPhase: process.env.NEXT_PHASE === "phase-production-build" || process.env.SKIP_DB_CHECK_DURING_BUILD === "true",
    },
    null,
    2
  )
);
