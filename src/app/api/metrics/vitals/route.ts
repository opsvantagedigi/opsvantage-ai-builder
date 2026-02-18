import { NextResponse } from "next/server";

import { recordWebVital } from "@/lib/monitoring/ux-vitals";

export const runtime = "nodejs";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
};

export async function OPTIONS() {
  return NextResponse.json({ ok: true }, { headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      name?: unknown;
      value?: unknown;
      path?: unknown;
      rating?: unknown;
    };

    await recordWebVital(body);

    return NextResponse.json({ ok: true }, { headers: corsHeaders });
  } catch (error) {
    const details = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: "Failed to record vital", details }, { status: 500, headers: corsHeaders });
  }
}
