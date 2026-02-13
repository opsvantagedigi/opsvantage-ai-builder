import { prisma } from "@/lib/prisma";
import dynamicComponent from "next/dynamic";

// Dynamically import the client component with SSR disabled
const NeuralDashboardClient = dynamicComponent(
  () => import("@/components/admin/NeuralDashboardClient"),
  { ssr: false }
);

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminDashboardPage() {
  let initialThoughts: Array<{ insight: string; category: string; createdAt: Date }> = [];
  let initialJournal: Array<{ insight: string; category: string; createdAt: Date }> = [];

  try {
    initialThoughts = await prisma.marzMemory.findMany({
      select: { insight: true, category: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    initialJournal = await prisma.marzMemory.findMany({
      where: {
        category: {
          in: ["CORE", "JOURNAL"],
        },
      },
      select: { insight: true, category: true, createdAt: true },
      orderBy: { createdAt: "asc" },
      take: 12,
    });
  } catch {
    initialThoughts = [];
    initialJournal = [];
  }

  // Convert Date objects to strings for the client component
  const initialThoughtsWithStringDates = initialThoughts.map(({ insight, category, createdAt }) => ({
    insight,
    category,
    createdAt: createdAt.toISOString(),
  }));

  const initialJournalWithStringDates = initialJournal.map(({ insight, category, createdAt }) => ({
    insight,
    category,
    createdAt: createdAt.toISOString(),
  }));

  return <NeuralDashboardClient initialThoughts={initialThoughtsWithStringDates} initialJournal={initialJournalWithStringDates} />;
}
