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
