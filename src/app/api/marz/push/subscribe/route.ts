import { NextRequest, NextResponse } from "next/server";
import { savePushSubscription } from "@/lib/push/subscription-store";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null) as { subscription?: any } | null;
  const subscription = body?.subscription;

  if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
    return NextResponse.json({ ok: false, error: "Invalid push subscription payload." }, { status: 400 });
  }

  await savePushSubscription(subscription);
  return NextResponse.json({ ok: true });
}
