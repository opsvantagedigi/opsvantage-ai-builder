import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { verifySession } from "@/lib/verify-session";
import { MarzAgent } from "@/lib/marz/agent-core";
import { generateSpeech, getInitialVoicePayload } from "@/lib/marz-logic";
import { ensureSentinelMemory } from "@/lib/marz/sentinel-memory";

const DEFAULT_PROMPT =
  "Deliver a concise ops update in a grounded New Zealand tone inspired by a calm, motherly advisor. Keep it under 70 words.";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const sovereignCookie = req.cookies.get("zenith_admin_token")?.value;
    const session = sovereignCookie ? null : await verifySession();

    if (!sovereignCookie && !session) {
      return NextResponse.json({ error: "Unauthorized: Neural Link Rejected" }, { status: 401 });
    }

    await ensureSentinelMemory(session?.sub ?? null);

    const body = (await req.json().catch(() => ({}))) as {
      gen_text?: unknown;
      text?: unknown;
      prompt?: unknown;
      firstLink?: boolean;
    };
    console.log("DEBUG PAYLOAD:", body);

    const speechText = String(body.gen_text || body.text || "Synchronisation complete.").trim();
    if (!speechText) {
      return NextResponse.json(
        {
          error: "Invalid payload",
          details: "Speech text cannot be empty.",
        },
        { status: 400 }
      );
    }

    const finalPrompt = typeof body.prompt === "string" && body.prompt.trim().length > 0 ? body.prompt.trim() : DEFAULT_PROMPT;

    const userRole = sovereignCookie ? "SOVEREIGN" : "CLIENT";

    let spokenText = speechText.slice(0, 450);
    if (body.firstLink && speechText === "Synchronisation complete.") {
      spokenText = getInitialVoicePayload(userRole);
    } else if (speechText === "Synchronisation complete.") {
      const agent = new MarzAgent(session?.email || "sovereign-admin");
      const marzReply = await agent.processMessage(finalPrompt, []);
      spokenText = marzReply.content?.replace(/\s+/g, " ").trim().slice(0, 450) || "Neural link is online.";
    }
    const speech = await generateSpeech(spokenText);
    const audioBytes = new Uint8Array(speech.audioBuffer.buffer, speech.audioBuffer.byteOffset, speech.audioBuffer.byteLength);
    const sourceBuffer = speech.audioBuffer.buffer as ArrayBuffer;
    const audioBuffer = sourceBuffer.slice(audioBytes.byteOffset, audioBytes.byteOffset + audioBytes.byteLength);

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "content-type": "audio/mpeg",
        "cache-control": "no-store",
        "x-marz-engine": speech.engine,
        "x-marz-text": encodeURIComponent(spokenText),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        error: "Neural Link voice pipeline failed.",
        details: message,
      },
      { status: 500 }
    );
  }
}
