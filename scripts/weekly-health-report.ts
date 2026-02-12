import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const base = (process.env.HEARTBEAT_URL || process.env.BASE_URL || "https://opsvantagedigital.online").replace(/\/$/, "");
  const heartbeatUrl = `${base}/api/marz/heartbeat`;

  let heartbeatStatus = "unknown";
  let neuralBridge = "unknown";
  let database = "unknown";
  let heartbeatError: string | undefined;

  try {
    const res = await fetch(heartbeatUrl, { headers: { accept: "application/json" } });
    const body = (await res.json()) as { status?: string; neural_bridge?: string; database?: string };
    heartbeatStatus = body.status ?? "unknown";
    neuralBridge = body.neural_bridge ?? "unknown";
    database = body.database ?? "unknown";
  } catch (error) {
    heartbeatError = error instanceof Error ? error.message : String(error);
  }

  const totalLeads: number = await prisma.launchLead.count();
  const windowStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const leadsLast7Days: number = await prisma.launchLead.count({ where: { createdAt: { gte: windowStart } } });

  const report = {
    timestamp: new Date().toISOString(),
    heartbeat: {
      url: heartbeatUrl,
      status: heartbeatStatus,
      neural_bridge: neuralBridge,
      database,
      error: heartbeatError,
    },
    waitlist: {
      total: totalLeads,
      last7Days: leadsLast7Days,
    },
  };

  console.log(JSON.stringify(report, null, 2));

  if (heartbeatStatus !== "ZENITH_ACTIVE" || neuralBridge !== "CONNECTED" || database !== "CONNECTED") {
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error("Health report failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
