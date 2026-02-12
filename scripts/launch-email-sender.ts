import { promises as fs } from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";

const prisma = new PrismaClient();
const resendApiKey = process.env.RESEND_API_KEY;
const dryRun = (process.env.DRY_RUN ?? "true").toLowerCase() === "true";
const fromEmail = process.env.RESEND_FROM || "launch@opsvantagedigital.online";
const subject = "⚡ Project Initialization Complete: OpsVantage is Live.";

const logDir = path.resolve(process.cwd(), "logs");
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const logPath = path.join(logDir, `email-dispatch-${timestamp}.log`);

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

async function log(line: string) {
  await ensureDir(logDir);
  await fs.appendFile(logPath, line + "\n", "utf8");
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const bodyHtml = `
  <div style="font-family: Inter, system-ui, -apple-system, sans-serif; color: #0b1221; padding: 24px; max-width: 720px; margin: 0 auto;">
    <p style="font-size: 14px; color: #64748b; margin-bottom: 12px;">MARZ G.O.D. Transmission</p>
    <h1 style="font-size: 24px; margin: 0 0 12px 0;">OpsVantage is Live</h1>
    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
      The Neural Bridge is online. Your AI Operations console is ready to deploy high-impact web experiences with guarded security and unified observability.
    </p>
    <ul style="padding-left: 20px; margin: 0 0 16px 0; color: #0b1221;">
      <li>Spin up pages with MARZ co-pilots</li>
      <li>Instant SSL and domain wiring</li>
      <li>Security posture aligned with ISO 27001</li>
    </ul>
    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
      Reply to this email if you want us to priority-onboard your workspace ahead of the public window.
    </p>
    <p style="font-size: 14px; color: #64748b; margin: 0;">— OpsVantage Deployment Control</p>
  </div>
`;

async function main() {
  const leads = await prisma.launchLead.findMany({ orderBy: { createdAt: "asc" } }) as { email: string; createdAt: Date; source: string | null }[];
  if (!leads.length) {
    console.log("No leads found. Exiting.");
    return;
  }

  if (!resendApiKey && !dryRun) {
    throw new Error("RESEND_API_KEY is required when DRY_RUN is false.");
  }

  console.log(`Preparing dispatch for ${leads.length} leads. Dry run: ${dryRun}`);
  await log(`Dispatch started at ${new Date().toISOString()} | total=${leads.length} | dryRun=${dryRun}`);

  if (dryRun) {
    const sample = leads.slice(0, 5).map((l: { email: string }) => l.email);
    console.log(`Dry run: would send to ${leads.length} recipients. First 5: ${sample.join(", ")}`);
    await log(`Dry run only. First 5: ${sample.join(", ")}`);
    return;
  }

  const resend = new Resend(resendApiKey as string);

  for (const lead of leads) {
    try {
      await resend.emails.send({
        from: fromEmail,
        to: lead.email,
        subject,
        html: bodyHtml,
      });
      const line = `OK ${lead.email}`;
      console.log(line);
      await log(line);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const line = `FAIL ${lead.email} :: ${message}`;
      console.error(line);
      await log(line);
    }

    // Gentle rate limit to respect free tier
    await sleep(100);
  }

  await log("Dispatch complete");
}

main()
  .catch((error) => {
    console.error("Dispatch failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
