import { NextResponse } from "next/server";

export const runtime = "nodejs";

function toWsUrl(httpUrl: string) {
  const trimmed = httpUrl.trim().replace(/\/$/, "");
  if (trimmed.startsWith("wss://") || trimmed.startsWith("ws://")) {
    return `${trimmed}/ws/neural-core`;
  }

  if (trimmed.startsWith("https://")) {
    return `wss://${trimmed.slice("https://".length)}/ws/neural-core`;
  }
  if (trimmed.startsWith("http://")) {
    return `ws://${trimmed.slice("http://".length)}/ws/neural-core`;
  }

  return null;
}

export async function GET() {
  const neuralCoreUrl = String(process.env["NEXT_PUBLIC_NEURAL_CORE_URL"] || "").trim();
  const neuralCoreWsUrl = String(process.env["NEXT_PUBLIC_NEURAL_CORE_WS_URL"] || "").trim();

  const resolvedWsUrl = neuralCoreWsUrl || (neuralCoreUrl ? toWsUrl(neuralCoreUrl) : null) || "";

  return NextResponse.json(
    {
      neuralCoreUrl,
      neuralCoreWsUrl: resolvedWsUrl,
      marzVideoMode: String(process.env["NEXT_PUBLIC_MARZ_VIDEO_MODE"] || "").trim() || "true",
    },
    {
      headers: {
        "cache-control": "no-store",
      },
    }
  );
}
