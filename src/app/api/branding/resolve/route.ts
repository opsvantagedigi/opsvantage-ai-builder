import { NextResponse } from "next/server";

import { resolveBrandOverrideFromRequest } from "@/lib/branding/brand-override";

export const runtime = "nodejs";

export async function GET() {
  const override = await resolveBrandOverrideFromRequest();
  return NextResponse.json({
    ok: true,
    override,
  });
}
