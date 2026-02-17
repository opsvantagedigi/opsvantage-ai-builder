import { getCache, setCache } from "@/lib/cache/memory-store";

export type WebVitalName = "CLS" | "LCP";

export type WebVitalSample = {
  name: WebVitalName;
  value: number;
  path?: string;
  rating?: string;
  ts: string;
};

type StoredVitals = {
  samples: WebVitalSample[];
};

const STORE_KEY = "ux:vitals:v1";
const MAX_SAMPLES = 500;
const WINDOW_MS = 10 * 60 * 1000;

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function percentile(values: number[], p: number): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil(p * sorted.length) - 1));
  return sorted[index] ?? null;
}

export async function recordWebVital(input: {
  name?: unknown;
  value?: unknown;
  path?: unknown;
  rating?: unknown;
}): Promise<void> {
  const name = String(input.name ?? "").toUpperCase() as WebVitalName;
  if (name !== "CLS" && name !== "LCP") return;

  const value = toNumber(input.value);
  if (value === null) return;

  const sample: WebVitalSample = {
    name,
    value,
    path: typeof input.path === "string" ? input.path.slice(0, 200) : undefined,
    rating: typeof input.rating === "string" ? input.rating.slice(0, 32) : undefined,
    ts: new Date().toISOString(),
  };

  const existing = (await getCache<StoredVitals>(STORE_KEY)) ?? { samples: [] };
  const now = Date.now();

  const pruned = existing.samples
    .filter((s) => now - new Date(s.ts).getTime() <= WINDOW_MS)
    .slice(-MAX_SAMPLES + 1);

  pruned.push(sample);

  await setCache(STORE_KEY, { samples: pruned }, 60 * 20);
}

export async function getUxVitalsSummary(): Promise<{
  windowMinutes: number;
  samples: number;
  lcpP75Ms: number | null;
  clsP75: number | null;
}> {
  const existing = (await getCache<StoredVitals>(STORE_KEY)) ?? { samples: [] };
  const now = Date.now();

  const windowed = existing.samples.filter((s) => now - new Date(s.ts).getTime() <= WINDOW_MS);

  const lcpValues = windowed.filter((s) => s.name === "LCP").map((s) => s.value);
  const clsValues = windowed.filter((s) => s.name === "CLS").map((s) => s.value);

  return {
    windowMinutes: 10,
    samples: windowed.length,
    lcpP75Ms: percentile(lcpValues, 0.75),
    clsP75: percentile(clsValues, 0.75),
  };
}
