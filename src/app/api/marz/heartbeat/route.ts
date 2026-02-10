import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from 'next/server';

export async function GET() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    // Check if key exists to avoid crash
    if (!process.env.GEMINI_API_KEY) throw new Error("Key missing");

    const prompt = "Act as MARZ AI. Generate 3 brief, cryptic, high-tech terminal status logs about cloud infrastructure health. No emojis. Max 10 words per line.";
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const thoughts = response.text().split('\n').filter(line => line.trim() !== "");

    return NextResponse.json({
      status: "ZENITH_ACTIVE",
      messages: thoughts,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    // Fail-safe fallback
    return NextResponse.json({
      status: "FALLBACK_MODE",
      messages: [
        "Neural link offline. Using local buffer...",
        "Edge nodes reporting nominal status.",
        "Awaiting Gemini API handshake..."
      ],
      timestamp: new Date().toISOString()
    });
  }
}