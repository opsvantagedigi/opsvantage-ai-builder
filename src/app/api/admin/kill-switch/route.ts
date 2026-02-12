import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { applyRateLimit } from "@/lib/rate-limit";
import { getGlobalLaunchActive, setGlobalLaunchActive } from "@/lib/global-launch";

function isAdminEmail(email?: string | null) {
  if (!email) return false;

  const allowList = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  return allowList.length > 0 && allowList.includes(email.toLowerCase());
}

async function isAuthorized(req: NextRequest) {
  const sovereignCookie = req.cookies.get("zenith_admin_token")?.value;
  if (sovereignCookie) return true;

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "dev-nextauth-secret" });
  const email = (token as any)?.email as string | undefined;
  return isAdminEmail(email);
}

export async function GET(req: NextRequest) {
  const rate = applyRateLimit(req, { keyPrefix: "api:admin:kill-switch:get", limit: 90, windowMs: 60_000 });
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many requests." },
      { status: 429, headers: { "Retry-After": `${rate.retryAfterSeconds}` } }
    );
  }

  const globalLaunchActive = await getGlobalLaunchActive();
  return NextResponse.json({ globalLaunchActive }, { status: 200 });
}

export async function POST(req: NextRequest) {
  const rate = applyRateLimit(req, { keyPrefix: "api:admin:kill-switch:post", limit: 30, windowMs: 60_000 });
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many requests." },
      { status: 429, headers: { "Retry-After": `${rate.retryAfterSeconds}` } }
    );
  }

  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as { globalLaunchActive?: boolean; confirmCode?: string };
  if (body.confirmCode !== "LAUNCH") {
    return NextResponse.json({ error: "Confirmation code required." }, { status: 400 });
  }

  const nextValue = Boolean(body.globalLaunchActive);
  await setGlobalLaunchActive(nextValue);

  return NextResponse.json({ globalLaunchActive: nextValue }, { status: 200 });
}
