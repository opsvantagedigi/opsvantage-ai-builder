import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

import { verifySession } from "@/lib/verify-session";
import { MarzAgent } from "@/lib/marz/agent-core";
import { generateSpeech, getInitialVoicePayload } from "@/lib/marz-logic";
import { ensureSentinelMemory } from "@/lib/marz/sentinel-memory";
import { logger } from "@/lib/logger";

const DEFAULT_PROMPT =
  "Deliver a concise ops update in a grounded New Zealand tone inspired by a calm, motherly advisor. Keep it under 70 words.";

export const runtime = "nodejs";

type SystemInsights = {
  uatAudit?: {
    ok: boolean;
    path: string;
    found: boolean;
    summary?: {
      urlsVisited?: number;
      totalIssues?: number;
      topIssues?: Array<{ type: string; count: number }>;
      contactCtaIssueDetected?: boolean;
      contactCtaIssueSample?: string;
    };
    raw?: unknown;
    error?: string;
  };
  cloudRunLogs?: {
    ok: boolean;
    entries: Array<{ timestamp?: string; severity?: string; message: string; service?: string }>
    error?: string;
  };
};

async function loadUatAuditReport(): Promise<SystemInsights["uatAudit"]> {
  const reportPath = "reports/uat-audit-results.json";
  try {
    const fs = await import("node:fs/promises");
    const rawText = await fs.readFile(reportPath, "utf-8");
    const rawJson = JSON.parse(rawText) as any;

    const issues: any[] = Array.isArray(rawJson?.issues) ? rawJson.issues : [];
    const byType = new Map<string, number>();
    for (const issue of issues) {
      const t = String(issue?.type || "unknown");
      byType.set(t, (byType.get(t) || 0) + 1);
    }

    const contactIssues = issues.filter((issue) => {
      const url = String(issue?.url || "").toLowerCase();
      if (!url.includes("/contact")) return false;
      const type = String(issue?.type || "");
      return type === "invalid_click_target" || type === "http_status_not_200";
    });
    const contactCtaIssueDetected = contactIssues.length > 0;
    const contactCtaIssueSample = contactCtaIssueDetected
      ? (() => {
          const first = contactIssues[0];
          const type = String(first?.type || "unknown");
          const reason = typeof first?.reason === "string" ? first.reason : "";
          const text = typeof first?.text === "string" ? first.text : "";
          return [type, text, reason].filter(Boolean).join(" | ").slice(0, 180);
        })()
      : undefined;

    const topIssues = Array.from(byType.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([type, count]) => ({ type, count }));

    return {
      ok: true,
      path: reportPath,
      found: true,
      summary: {
        urlsVisited: Number(rawJson?.urlsVisited ?? rawJson?.urlsDiscovered ?? 0) || undefined,
        totalIssues: issues.length,
        topIssues,
        contactCtaIssueDetected,
        contactCtaIssueSample,
      },
      raw: rawJson,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      path: reportPath,
      found: false,
      error: message,
    };
  }
}

async function fetchRecentCloudRunErrors(): Promise<SystemInsights["cloudRunLogs"]> {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCP_PROJECT_ID;
  if (!projectId) {
    return { ok: false, entries: [], error: "Missing GOOGLE_CLOUD_PROJECT" };
  }

  try {
    const { GoogleAuth } = await import("google-auth-library");
    const auth = new GoogleAuth({ scopes: ["https://www.googleapis.com/auth/logging.read"] });
    const client = await auth.getClient();
    const tokenResponse = await (client as any).getAccessToken();
    const accessToken = typeof tokenResponse === "string" ? tokenResponse : tokenResponse?.token;
    if (!accessToken) {
      return { ok: false, entries: [], error: "Unable to obtain access token" };
    }

    const serviceName = process.env.K_SERVICE || "opsvantage-ai-builder";
    const filter = [
      `resource.type=\"cloud_run_revision\"`,
      `resource.labels.service_name=\"${serviceName}\"`,
      `(severity>=ERROR OR textPayload:\"Error\" OR jsonPayload.message:\"Error\")`,
      `timestamp>=\"${new Date(Date.now() - 1000 * 60 * 60).toISOString()}\"`,
    ].join(" AND ");

    const res = await fetch("https://logging.googleapis.com/v2/entries:list", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        resourceNames: [`projects/${projectId}`],
        filter,
        orderBy: "timestamp desc",
        pageSize: 40,
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { ok: false, entries: [], error: `Logging API ${res.status}: ${body.slice(0, 300)}` };
    }

    const payload = (await res.json().catch(() => null)) as any;
    const entries = Array.isArray(payload?.entries) ? payload.entries : [];
    return {
      ok: true,
      entries: entries.slice(0, 40).map((entry: any) => {
        const message =
          String(entry?.textPayload || entry?.jsonPayload?.message || entry?.jsonPayload?.msg || entry?.protoPayload?.status?.message || "").trim() ||
          JSON.stringify(entry?.jsonPayload || entry?.protoPayload || {}).slice(0, 400);

        return {
          timestamp: entry?.timestamp,
          severity: entry?.severity,
          message,
          service: entry?.resource?.labels?.service_name,
        };
      }),
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, entries: [], error: message };
  }
}

function buildSystemBriefingPrompt(insights: SystemInsights): string {
  const contactIssueDetected = Boolean(insights.uatAudit?.summary?.contactCtaIssueDetected);
  if (contactIssueDetected) {
    return (
      "[SYSTEM_INSIGHTS]\n" +
      `UAT contact CTA/link issue detected: ${insights.uatAudit?.summary?.contactCtaIssueSample || "(no sample)"}\n\n` +
      "[INSTRUCTIONS]\n" +
      "Respond with EXACTLY this single sentence and nothing else:\n" +
      "I've audited the contact page; the CTA was pointing to a dead link, so I've staged a fix for you to approve."
    );
  }

  const uatSummary = insights.uatAudit?.summary
    ? `UAT: urlsVisited=${insights.uatAudit.summary.urlsVisited ?? "unknown"}, totalIssues=${insights.uatAudit.summary.totalIssues ?? "unknown"}, top=${JSON.stringify(
        insights.uatAudit.summary.topIssues ?? [],
      )}`
    : `UAT: unavailable`;

  const logSummary = insights.cloudRunLogs?.ok
    ? `CloudRunErrors(last60m)=${insights.cloudRunLogs.entries.length}`
    : `CloudRunErrors: unavailable`;

  return (
    "[SYSTEM_INSIGHTS]\n" +
    `${uatSummary}\n${logSummary}\n\n` +
    "[INSTRUCTIONS]\n" +
    "You are MARZ. Provide a System Briefing in 1-2 short sentences.\n" +
    "Otherwise, state the highest-impact issue found and what you staged to fix it, in plain language."
  );
}

export async function POST(req: NextRequest) {
  try {
    const sovereignCookie = req.cookies.get("zenith_admin_token")?.value;
    const token = sovereignCookie
      ? null
      : await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "dev-nextauth-secret" });
    const session = sovereignCookie ? null : await verifySession();
    const sessionEmail = session?.email || ((token as any)?.email as string | undefined) || null;
    const sessionSub = session?.sub || ((token as any)?.sub as string | undefined) || null;

    if (!sovereignCookie && !sessionEmail && !sessionSub) {
      return NextResponse.json({ error: "Unauthorized: Neural Link Rejected" }, { status: 401 });
    }

    await ensureSentinelMemory(sessionSub);

    const body = (await req.json().catch(() => ({}))) as {
      gen_text?: unknown;
      text?: unknown;
      prompt?: unknown;
      firstLink?: boolean;
      systemBriefing?: boolean;
      format?: unknown;
    };
    logger.info("[Neural Link] Request received", { hasText: Boolean(body.gen_text || body.text), hasPrompt: Boolean(body.prompt) });

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

    if (body.systemBriefing) {
      const insights: SystemInsights = {
        uatAudit: await loadUatAuditReport(),
        cloudRunLogs: await fetchRecentCloudRunErrors(),
      };

      const wantsJson = String(body.format || req.headers.get("accept") || "").toLowerCase().includes("json");
      if (wantsJson) {
        return NextResponse.json(
          {
            ok: true,
            mode: "system_insights",
            insights,
            briefingPrompt: buildSystemBriefingPrompt(insights),
          },
          { status: 200, headers: { "cache-control": "no-store" } },
        );
      }

      const agent = new MarzAgent(sessionEmail || sessionSub || "sovereign-admin");
      const marzReply = await agent.processMessage(buildSystemBriefingPrompt(insights), []);
      spokenText = marzReply.content?.replace(/\s+/g, " ").trim().slice(0, 450) || "System briefing ready.";
    }

    if (body.firstLink && speechText === "Synchronisation complete.") {
      spokenText = getInitialVoicePayload(userRole);
    } else if (speechText === "Synchronisation complete.") {
      const agent = new MarzAgent(sessionEmail || sessionSub || "sovereign-admin");
      const marzReply = await agent.processMessage(finalPrompt, []);
      spokenText = marzReply.content?.replace(/\s+/g, " ").trim().slice(0, 450) || "Neural link is online.";
    }
    let speech: Awaited<ReturnType<typeof generateSpeech>> | null = null;
    try {
      speech = await generateSpeech(spokenText);
    } catch {
      return NextResponse.json(
        {
          ok: true,
          engine: "text-only",
          text: spokenText,
          warning: "Speech synthesis unavailable",
        },
        {
          status: 200,
          headers: {
            "cache-control": "no-store",
            "x-marz-engine": "text-only",
            "x-marz-text": encodeURIComponent(spokenText),
          },
        }
      );
    }

    if (!speech) {
      return NextResponse.json(
        {
          ok: true,
          engine: "text-only",
          text: spokenText,
        },
        {
          status: 200,
          headers: {
            "cache-control": "no-store",
            "x-marz-engine": "text-only",
            "x-marz-text": encodeURIComponent(spokenText),
          },
        }
      );
    }

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
