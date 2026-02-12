import NeuralDashboardClient from "@/components/admin/NeuralDashboardClient";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminDashboardPage() {
  let initialThoughts: Array<{ insight: string; category: string; createdAt: Date }> = [];

  try {
    initialThoughts = await prisma.marzMemory.findMany({
      select: { insight: true, category: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  } catch {
    initialThoughts = [];
  }

  return <NeuralDashboardClient initialThoughts={initialThoughts} />;
}
