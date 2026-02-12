import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { verifySession } from "@/lib/verify-session";
import { MarzAgent } from "@/lib/marz/agent-core";
import { getInitialVoicePayload } from "@/lib/marz-logic";
import { ensureSentinelMemory } from "@/lib/marz/sentinel-memory";

const VOICE_ID = "EXAVITQu4vr4xnSDxMaL"; // Rachel - Standard ElevenLabs voice
const ELEVENLABS_MODEL_ID = "eleven_multilingual_v2";
const ELEVENLABS_MODEL_LABEL = "Rachel-V2";
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

    const { prompt, firstLink } = (await req.json().catch(() => ({}))) as { prompt?: string; firstLink?: boolean };
    const finalPrompt = typeof prompt === "string" && prompt.trim().length > 0 ? prompt.trim() : DEFAULT_PROMPT;

    const userRole = sovereignCookie ? "SOVEREIGN" : "CLIENT";

    let spokenText = "Neural link is online.";
    if (firstLink) {
      spokenText = getInitialVoicePayload(userRole);
    } else {
      const agent = new MarzAgent(session?.email || "sovereign-admin");
      const marzReply = await agent.processMessage(finalPrompt, []);
      spokenText = marzReply.content?.replace(/\s+/g, " ").trim().slice(0, 450) || "Neural link is online.";
    }

    const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
    if (!elevenLabsApiKey) {
      return NextResponse.json({ error: "ELEVENLABS_API_KEY is not configured." }, { status: 503 });
    }

    const ttsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream`, {
      method: "POST",
      headers: {
        "xi-api-key": elevenLabsApiKey,
        "content-type": "application/json",
        accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: spokenText,
        model_id: ELEVENLABS_MODEL_ID,
        voice_settings: {
          stability: 0.45,
          similarity_boost: 0.85,
          style: 0.2,
          use_speaker_boost: true,
        },
      }),
    });

    let audioBuffer: string;
    let modelLabel = ELEVENLABS_MODEL_LABEL;

    if (!ttsResponse.ok) {
      const details = await ttsResponse.text();
      
      // Check if the error is due to payment required (free tier limitation)
      if (ttsResponse.status === 402) { // Payment Required
        // Fallback to a browser-based speech synthesis
        console.log("ElevenLabs payment required, falling back to browser speech synthesis");
        
        // Return a success response with a placeholder audio and a different model label
        // The client will handle the browser-based speech synthesis
        audioBuffer = ""; // Will be handled by browser
        modelLabel = "Browser-TTS";
        
        return NextResponse.json({
          voiceId: "browser_synthesis",
          modelId: "browser_tts",
          modelLabel: modelLabel,
          text: spokenText,
          audioBase64: audioBuffer,
        });
      } else {
        return NextResponse.json(
          {
            error: "ElevenLabs synthesis failed.",
            details: details.slice(0, 600),
          },
          { status: 502 }
        );
      }
    }

    audioBuffer = Buffer.from(await ttsResponse.arrayBuffer()).toString("base64");

    return NextResponse.json({
      voiceId: VOICE_ID,
      modelId: ELEVENLABS_MODEL_ID,
      modelLabel: modelLabel,
      text: spokenText,
      audioBase64: audioBuffer,
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
