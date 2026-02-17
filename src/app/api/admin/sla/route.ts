import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { MonitoringService } from "@/lib/monitoring/MonitoringService";
import { getUxVitalsSummary } from "@/lib/monitoring/ux-vitals";

export const runtime = "nodejs";

function isAdminEmail(email?: string | null) {
  if (!email) return false;

  const allowList = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  return allowList.length > 0 && allowList.includes(email.toLowerCase());
}

function getSuiteReport() {
  const reportPath = resolve(process.cwd(), ".opsvantage", "test-suite-enterprise-v1.json");

  try {
    const raw = readFileSync(reportPath, "utf8");
    const parsed = JSON.parse(raw) as {
      suite?: string;
      status?: string;
      accuracy?: number;
      videoLinkUnlocked?: boolean;
      finishedAt?: string;
    };

    return {
      suite: parsed.suite ?? "TestSuite_Enterprise_V1",
      status: parsed.status ?? "NOT_RUN",
      accuracy: typeof parsed.accuracy === "number" ? parsed.accuracy : 0,
      videoLinkUnlocked: Boolean(parsed.videoLinkUnlocked),
      finishedAt: parsed.finishedAt ?? null,
    };
  } catch {
    return {
      suite: "TestSuite_Enterprise_V1",
      status: "NOT_RUN",
      accuracy: 0,
      videoLinkUnlocked: false,
      finishedAt: null,
    };
  }
}

export async function GET(req: NextRequest) {
  const sovereignCookie = req.cookies.get("zenith_admin_token")?.value;
  const isSovereign = Boolean(sovereignCookie);

  if (!isSovereign) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "dev-nextauth-secret" });
    const email = (token as { email?: string } | null)?.email;
    if (!isAdminEmail(email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const appBaseUrl =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.APP_BASE_URL?.trim() ||
    "https://opsvantage-ai-builder-1018462465472.europe-west4.run.app";

  const monitoringService = new MonitoringService();
  const [snapshot, suite, ux] = await Promise.all([
    monitoringService.getSlaSnapshot(appBaseUrl),
    Promise.resolve(getSuiteReport()),
    getUxVitalsSummary(),
  ]);

  return NextResponse.json({
    ok: true,
    snapshot: {
      ...snapshot,
      ux,
    },
    suite,
    sampledAt: new Date().toISOString(),
  });
}
