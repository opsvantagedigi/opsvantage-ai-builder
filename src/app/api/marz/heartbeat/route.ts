import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const NEURAL_CORE_HEALTH_PATH = "/health";

const withTimeout = async <T,>(
  run: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number
): Promise<T> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await run(controller.signal);
  } finally {
    clearTimeout(timeout);
  }
};

const fetchWithSignal = async (url: string, signal: AbortSignal) => {
  const res = await fetch(url, {
    method: "GET",
    cache: "no-store",
    headers: { accept: "application/json" },
    signal,
  });
  return res;
};

export async function GET() {
  if (process.env.NEXT_PHASE === "phase-production-build" || process.env.SKIP_DB_CHECK_DURING_BUILD === "true") {
    return NextResponse.json({ status: "SKIPPED_DURING_BUILD" });
  }

  const now = new Date().toISOString();

  // Database check
  let database: "CONNECTED" | "OFFLINE" = "OFFLINE";
  try {
    await prisma.$queryRaw`SELECT 1`;
    database = "CONNECTED";
  } catch (error) {
    database = "OFFLINE";
  }

  // Neural Core health check (this is what powers MARZ video chat)
  let neural_bridge: "CONNECTED" | "OFFLINE" = "OFFLINE";
  let status: "ZENITH_ACTIVE" | "FALLBACK_MODE" = "FALLBACK_MODE";
  let messages: string[] = [
    "Neural link offline. Using local buffer...",
    "Edge nodes reporting nominal status.",
    "Awaiting Neural Core handshake...",
  ];

  const baseUrl = (process.env.NEXT_PUBLIC_NEURAL_CORE_URL || "").trim();
  if (baseUrl) {
    const healthUrl = `${baseUrl.replace(/\/$/, "")}${NEURAL_CORE_HEALTH_PATH}`;
    try {
      const res = await withTimeout((signal: AbortSignal) => fetchWithSignal(healthUrl, signal), 4500);
      if (res.ok) {
        neural_bridge = "CONNECTED";
        status = "ZENITH_ACTIVE";
        messages = [
          "Neural Core connected.",
          "Audio/video pipeline ready.",
          "Awaiting sovereign input.",
        ];
      }
    } catch {
      // leave as OFFLINE
    }
  }

  return NextResponse.json({
    status,
    neural_bridge,
    database,
    version: "1.0.0-Beta",
    messages,
    timestamp: now,
  });
}