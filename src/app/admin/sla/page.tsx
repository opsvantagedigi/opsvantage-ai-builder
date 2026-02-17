import { redirect } from "next/navigation";

import { verifySession } from "@/lib/verify-session";
import { SlaHudClient } from "@/components/admin/SlaHudClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminSlaPage() {
  const session = await verifySession();
  if (!session) {
    redirect("/sovereign-access");
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-xl border border-slate-700 bg-slate-900/70 p-5">
          <h1 className="text-2xl font-semibold text-cyan-300">Sentinel HUD</h1>
          <p className="mt-1 text-sm text-slate-400">Enterprise SLA observability surface for uptime, latency, saturation, and verification lock-state.</p>
        </header>

        <SlaHudClient />
      </div>
    </main>
  );
}
