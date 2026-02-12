import NeuralDashboardClient from "@/components/admin/NeuralDashboardClient";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const initialThoughts = await prisma.marzMemory.findMany({
    select: { insight: true, category: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return <NeuralDashboardClient initialThoughts={initialThoughts} />;
}
