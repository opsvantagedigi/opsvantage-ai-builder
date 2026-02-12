import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const MODEL_NAME = process.env.GEMINI_MODEL_NAME || "gemini-1.5-flash-latest";

export async function GET() {
  if (process.env.NEXT_PHASE === "phase-production-build" || process.env.SKIP_DB_CHECK_DURING_BUILD === "true") {
    return NextResponse.json({ status: "SKIPPED_DURING_BUILD" });
  }

  const now = new Date().toISOString();

  // Database check
  let database: "CONNECTED" | "OFFLINE" = "OFFLINE";
  try {
    await prisma.$queryRaw`SELECT 1`;
    database = "CONNECTED";
  } catch (error) {
    database = "OFFLINE";
  }

  // Gemini check
  let neural_bridge: "CONNECTED" | "OFFLINE" = "OFFLINE";
  let status: "ZENITH_ACTIVE" | "FALLBACK_MODE" = "FALLBACK_MODE";
  let messages: string[] = [
    "Neural link offline. Using local buffer...",
    "Edge nodes reporting nominal status.",
    "Awaiting Gemini API handshake...",
  ];

  try {
    if (!process.env.GEMINI_API_KEY) throw new Error("Key missing");

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const prompt =
      "Act as MARZ AI. Generate 3 brief, cryptic, high-tech terminal status logs about cloud infrastructure health. No emojis. Max 10 words per line.";

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const thoughts = response
      .text()
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    neural_bridge = "CONNECTED";
    status = "ZENITH_ACTIVE";
    messages = thoughts.length ? thoughts : messages;
  } catch (error) {
    neural_bridge = "OFFLINE";
    status = "FALLBACK_MODE";
  }

  return NextResponse.json({
    status,
    neural_bridge,
    database,
    version: "1.0.0-Beta",
    messages,
    timestamp: now,
  });
}