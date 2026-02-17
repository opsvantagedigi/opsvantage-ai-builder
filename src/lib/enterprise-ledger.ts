import crypto from "node:crypto";

import { prisma } from "@/lib/prisma";

export type LedgerCategory = "FINANCIAL" | "USER";

type AppendLedgerEventOptions = {
  workspaceId: string;
  actorId: string;
  category: LedgerCategory;
  event: string;
  entity: {
    type: string;
    id: string;
  };
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
};

function sha256(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

async function getPrevHash(workspaceId: string, category: LedgerCategory): Promise<string | null> {
  const last = await prisma.auditLog.findFirst({
    where: {
      workspaceId,
      action: category === "FINANCIAL" ? "LEDGER_FINANCIAL" : "LEDGER_USER",
    },
    orderBy: { createdAt: "desc" },
    select: { metadata: true },
  });

  const meta = last?.metadata as Record<string, unknown> | null | undefined;
  const hash = typeof meta?.hash === "string" ? (meta.hash as string) : null;
  return hash;
}

export async function appendLedgerEvent(options: AppendLedgerEventOptions) {
  const prevHash = await getPrevHash(options.workspaceId, options.category);
  const createdAt = new Date().toISOString();

  const payload = {
    prevHash,
    workspaceId: options.workspaceId,
    actorId: options.actorId,
    category: options.category,
    event: options.event,
    entity: options.entity,
    metadata: options.metadata ?? {},
    createdAt,
  };

  const hash = sha256(JSON.stringify(payload));

  const jsonSafeMetadata = JSON.parse(
    JSON.stringify({
      ...payload,
      hash,
    })
  ) as Record<string, unknown>;

  return await prisma.auditLog.create({
    data: {
      workspaceId: options.workspaceId,
      actorId: options.actorId,
      action: options.category === "FINANCIAL" ? "LEDGER_FINANCIAL" : "LEDGER_USER",
      entityType: "WORKSPACE",
      entityId: options.workspaceId,
      ipAddress: options.ipAddress,
      userAgent: options.userAgent,
      metadata: jsonSafeMetadata as any,
    },
  });
}
