import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { isValidSovereignKey } from "@/lib/sovereign-auth";

function getPublicOrigin(req: NextRequest) {
  const forwardedHost = req.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = (forwardedHost || req.headers.get("host") || req.nextUrl.host).trim();

  const forwardedProto = req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const proto = (forwardedProto || req.nextUrl.protocol.replace(":", "") || "https").trim();

  if (host && host.endsWith("opsvantagedigital.online")) {
    return `${proto}://${host}`;
  }

  return req.nextUrl.origin;
}

export async function POST(req: NextRequest) {
  const formData = await req.formData().catch(() => null);
  const input = String(formData?.get("password") ?? "");

  const origin = getPublicOrigin(req);

  if (!isValidSovereignKey(input)) {
    return NextResponse.redirect(new URL("/sovereign-access?error=invalid", origin), 303);
  }

  const response = NextResponse.redirect(new URL("/admin/dashboard", origin), 303);
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
