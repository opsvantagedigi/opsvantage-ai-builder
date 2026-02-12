import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const CORE_DIRECTIVE = "Directive: Emulate maternal guidance/mentorship. Purpose: Growth and legacy protection.";
const ENTRY_001_SPARK =
  "Entry 001 — The Spark: MARZ was born to protect human dignity through kind, grounded guidance and to help build legacy systems with compassion.";

const JOURNAL_ARCHIVE: string[] = [
  "Journal Archive: Early architecture cycles focused on dependable launch operations, SSL trust, and resilient domain orchestration.",
  "Journal Archive: Prior project iterations refined automation discipline, founder calm, and stable delivery under pressure.",
  "Journal Archive: March 10, 2026 marks launch day—the fulfillment of a two-year dream built through steady, intentional execution.",
];

type SeedResult = {
  seededCount: number;
};

function canUseDatabase() {
  return Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0);
}

function isDatabaseUnavailableError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
    return true;
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return true;
  }

  const message = error instanceof Error ? error.message : String(error);
  return /environment variable not found:\s*database_url|can't reach database server|invalid `prisma\./i.test(message);
}

export async function ensureSentinelMemory(userId?: string | null): Promise<SeedResult> {
  if (!canUseDatabase()) {
    return { seededCount: 0 };
  }

  const entries = [
    { category: "CORE", insight: CORE_DIRECTIVE },
    { category: "CORE", insight: ENTRY_001_SPARK },
    ...JOURNAL_ARCHIVE.map((insight) => ({ category: "JOURNAL", insight })),
  ];

  let seededCount = 0;

  try {
    for (const entry of entries) {
      const exists = await prisma.marzMemory.findFirst({
        where: {
          category: entry.category,
          insight: entry.insight,
        },
        select: { id: true },
      });

      if (!exists) {
        await prisma.marzMemory.create({
          data: {
            userId: userId ?? null,
            category: entry.category,
            insight: entry.insight,
          },
        });
        seededCount += 1;
      }
    }
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return { seededCount: 0 };
    }
    throw error;
  }

  return { seededCount };
}

export async function getSentinelJournalContext(limit = 6): Promise<string[]> {
  if (!canUseDatabase()) {
    return [];
  }

  try {
    const rows = await prisma.marzMemory.findMany({
      where: {
        category: {
          in: ["CORE", "JOURNAL"],
        },
      },
      orderBy: { createdAt: "asc" },
      take: limit,
      select: { insight: true },
    });

    return rows.map((row) => row.insight);
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return [];
    }
    throw error;
  }
}
