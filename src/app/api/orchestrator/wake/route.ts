import { NextResponse } from "next/server";

type WakePayload = {
  signal?: string;
  source?: string;
  reason?: string;
};

export async function POST(request: Request) {
  try {
    const expectedToken = process.env.NEXT_PUBLIC_GCP_ORCHESTRATOR_WAKE_TOKEN;
    const authHeader = request.headers.get("authorization") || "";

    if (expectedToken) {
      const expectedHeader = `Bearer ${expectedToken}`;
      if (authHeader !== expectedHeader) {
        return NextResponse.json({ error: "Unauthorized wake request." }, { status: 401 });
      }
    }

    const body = (await request.json().catch(() => ({}))) as WakePayload;
    const payload = {
      signal: body.signal || "WakeUp",
      source: body.source || "marz-display",
      reason: body.reason || "Neural core requested wake-up",
      timestamp: Date.now(),
    };

    const upstreamUrl = process.env.GCP_ORCHESTRATOR_WAKE_UPSTREAM_URL || "";
    const upstreamToken = process.env.GCP_ORCHESTRATOR_WAKE_UPSTREAM_TOKEN || "";

    if (upstreamUrl) {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (upstreamToken) {
        headers.Authorization = `Bearer ${upstreamToken}`;
      }

      const upstreamResponse = await fetch(upstreamUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
        cache: "no-store",
      });

      if (!upstreamResponse.ok) {
        return NextResponse.json(
          { ok: false, forwarded: false, upstreamStatus: upstreamResponse.status },
          { status: 502 }
        );
      }

      return NextResponse.json({ ok: true, forwarded: true });
    }

    return NextResponse.json({ ok: true, forwarded: false, message: "Wake request accepted locally." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Wake request failed.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
