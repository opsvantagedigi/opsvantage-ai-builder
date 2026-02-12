import { prisma } from "@/lib/prisma";

const GLOBAL_LAUNCH_KEY = "global_launch_active";

async function ensureSettingsTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "SystemSetting" (
      "key" TEXT PRIMARY KEY,
      "value" TEXT NOT NULL,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export async function getGlobalLaunchActive() {
  await ensureSettingsTable();
  const rows = await prisma.$queryRawUnsafe<Array<{ value: string }>>(
    `SELECT "value" FROM "SystemSetting" WHERE "key" = $1 LIMIT 1`,
    GLOBAL_LAUNCH_KEY
  );
  return rows[0]?.value === "true";
}

export async function setGlobalLaunchActive(active: boolean) {
  await ensureSettingsTable();
  await prisma.$executeRawUnsafe(
    `
      INSERT INTO "SystemSetting" ("key", "value", "updatedAt")
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      ON CONFLICT ("key")
      DO UPDATE SET "value" = EXCLUDED."value", "updatedAt" = CURRENT_TIMESTAMP
    `,
    GLOBAL_LAUNCH_KEY,
    active ? "true" : "false"
  );
}
