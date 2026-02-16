import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { deletePushSubscription, listPushSubscriptions } from "@/lib/push/subscription-store";

function setVapid() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const email = process.env.VAPID_SUBJECT || "mailto:ops@opsvantagedigital.online";

  if (!publicKey || !privateKey) {
    throw new Error("VAPID keys are not configured.");
  }

  webpush.setVapidDetails(email, publicKey, privateKey);
}

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
  const expectedToken = process.env.PUSH_SERVICE_TOKEN || "";
  if (!expectedToken || token !== expectedToken) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({})) as {
    title?: string;
    body?: string;
    tier?: "tier1" | "tier2";
    url?: string;
  };

  try {
    setVapid();
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 503 });
  }

  const payload = JSON.stringify({
    title: body.title || "MARZ • Proactive Thought",
    body: body.body || "I found a useful strategic signal.",
    tier: body.tier || "tier1",
    url: body.url || "/admin/dashboard",
  });

  const subscriptions = await listPushSubscriptions();
  const results = await Promise.allSettled(subscriptions.map(async (subscription) => {
    try {
      await webpush.sendNotification(subscription as any, payload);
      return { endpoint: subscription.endpoint, status: "sent" as const };
    } catch (error: any) {
      const statusCode = Number(error?.statusCode || 0);
      if (statusCode === 404 || statusCode === 410) {
        await deletePushSubscription(subscription.endpoint);
      }
      return { endpoint: subscription.endpoint, status: "failed" as const };
    }
  }));

  const sent = results.filter((item) => item.status === "fulfilled" && item.value.status === "sent").length;
  return NextResponse.json({ ok: true, attempted: subscriptions.length, sent });
}
