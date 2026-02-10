import { NextResponse } from "next/server";
import { verifySession } from "@/lib/verify-session";
import { MarzAgent } from "@/lib/marz/agent-core";
import { logger } from "@/lib/logger";

// POST: Chat with MARZ AI Operator
export async function POST(req: Request) {
  try {
    // 1. Verify user is authenticated
    const session = await verifySession();
    if (!session) {
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

    logger.info(
      `[MARZ Chat] Message received from ${session?.email}: "${message.substring(0, 50)}..."`
    );

    // 3. Initialize MARZ Agent with user context
    const agent = new MarzAgent(session?.email || "unknown");

    // 4. Process message with MARZ
    const response = await agent.processMessage(
      message,
      Array.isArray(history) ? history : []
    );

    logger.info(
      `[MARZ Chat] Response sent to ${session?.email}: "${response.content.substring(0, 50)}..."`
    );

    // 5. Return response
    return NextResponse.json({
      ...response,
      userId: session?.sub,
      userEmail: session?.email,
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
