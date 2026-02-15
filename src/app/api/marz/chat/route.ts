import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { verifySession } from "@/lib/verify-session";
import { MarzAgent } from "@/lib/marz/agent-core";
import { logger } from "@/lib/logger";
import { ensureSentinelMemory } from "@/lib/marz/sentinel-memory";

// POST: Chat with MARZ AI Operator
export async function POST(req: NextRequest) {
  try {
    const sovereignToken = req.cookies.get("zenith_admin_token")?.value;
    const isSovereign = Boolean(sovereignToken);

    const token = isSovereign
      ? null
      : await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "dev-nextauth-secret" });
    const session = isSovereign ? null : await verifySession();
    const sessionEmail = session?.email || ((token as any)?.email as string | undefined) || null;
    const sessionSub = session?.sub || ((token as any)?.sub as string | undefined) || null;

    if (!isSovereign && !sessionEmail && !sessionSub) {
      logger.warn("[MARZ Chat] Unauthorized access attempt");
      return NextResponse.json(
        { error: "Unauthorized: Neural Link Rejected" },
        { status: 401 }
      );
    }

    // 2. Parse request
    const { message, history } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message required and must be a string" },
        { status: 400 }
      );
    }

    const actorEmail = sessionEmail ?? "sovereign";
    const actorSub = sessionSub ?? null;

    logger.info(
      `[MARZ Chat] Message received from ${actorEmail}: "${message.substring(0, 50)}..."`
    );

    await ensureSentinelMemory(actorSub);

    // 3. Initialize MARZ Agent with user context
    const agent = new MarzAgent(sessionEmail || sessionSub || "sovereign-papa");

    // 4. Process message with MARZ
    const response = await agent.processMessage(
      message,
      Array.isArray(history) ? history : []
    );

    logger.info(
      `[MARZ Chat] Response sent to ${actorEmail}: "${response.content.substring(0, 50)}..."`
    );

    // 5. Return response
    return NextResponse.json({
      ...response,
      userId: actorSub,
      userEmail: sessionEmail || sessionSub || "sovereign-papa",
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`[MARZ Chat] API Error: ${errorMessage}`);

    return NextResponse.json(
      {
        error: "MARZ Neural Processing Failed",
        details: errorMessage,
        content: "⚠️ CRITICAL NEURAL FAILURE\n\nMARZ systems are offline. Contact your administrator.",
        isError: true,
      },
      { status: 500 }
    );
  }
}

// GET: Health check for MARZ chat endpoint
export async function GET() {
  try {
    const agent = new MarzAgent("system");
    const diagnostics = await agent.runSystemDiagnostics();

    return NextResponse.json({
      status: "operational",
      message: "MARZ Chat API Online",
      diagnostics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        status: "error",
        message: "MARZ Chat API Offline",
        error: errorMessage,
      },
      { status: 503 }
    );
  }
}
