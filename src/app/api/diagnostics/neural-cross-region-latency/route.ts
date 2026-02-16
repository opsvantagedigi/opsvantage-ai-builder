import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const target = process.env.NEXT_PUBLIC_NEURAL_CORE_URL?.trim();
  if (!target) {
    return NextResponse.json({ ok: false, error: "NEXT_PUBLIC_NEURAL_CORE_URL is not set." }, { status: 500 });
  }

  const healthUrl = `${target.replace(/\/$/, "")}/health`;
  const started = Date.now();
  const response = await fetch(healthUrl, { cache: "no-store" });
  const elapsedMs = Date.now() - started;

  return NextResponse.json({
    ok: response.ok,
    target: healthUrl,
    elapsedMs,
    under50ms: elapsedMs <= 50,
    measuredAt: new Date().toISOString(),
  }, { status: response.ok ? 200 : 502 });
}
