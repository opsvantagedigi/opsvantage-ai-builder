import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { isValidSovereignKey } from "@/lib/sovereign-auth";

export async function POST(req: NextRequest) {
  const formData = await req.formData().catch(() => null);
  const input = String(formData?.get("password") ?? "");

  if (!isValidSovereignKey(input)) {
    return NextResponse.redirect(new URL("/sovereign-access?error=invalid", req.url), 303);
  }

  const response = NextResponse.redirect(new URL("/admin/dashboard", req.url), 303);
  response.cookies.set("zenith_admin_token", "sovereign", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    domain: process.env.NODE_ENV === "production" ? ".opsvantagedigital.online" : undefined,
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return response;
}
