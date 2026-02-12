import { promises as fs } from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

function toCsvLine(values: string[]) {
  return values
    .map((v) => {
      if (v.includes("\"") || v.includes(",") || v.includes("\n")) {
        return `"${v.replace(/"/g, '""')}"`;
      }
      return v;
    })
    .join(",");
}

async function main() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const exportsDir = path.resolve(process.cwd(), "exports");
  await ensureDir(exportsDir);

  // Fetch all records from LaunchLead
  const leads = await prisma.launchLead.findMany({ 
    orderBy: { createdAt: "asc" } } as const);

  // Create CSV with email, createdAt, and source
  const header = toCsvLine(["Email", "CreatedAt", "Source"]);
  const lines = leads.map((lead: { email: string; createdAt: Date; source: string | null }) =>
    toCsvLine([
      lead.email,
      lead.createdAt.toISOString(),
      lead.source ?? "",
    ])
  );

  const content = [header, ...lines].join("\n") + "\n";
  const filePath = path.join(exportsDir, `leads_${timestamp}.csv`);
  await fs.writeFile(filePath, content, "utf8");

  console.log(`Exported ${leads.length} leads to ${filePath}`);
}

main()
  .catch((error) => {
    console.error("Lead harvest failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });