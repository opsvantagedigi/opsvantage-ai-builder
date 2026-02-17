import { headers } from "next/headers";

import { prisma } from "@/lib/prisma";

export type BrandOverride = {
  workspaceId: string;
  workspaceName: string;
  customDomain: string;
  logoUrl: string | null;
  colors: {
    primary?: string;
    secondary?: string;
  };
};

function normalizeHost(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return null;
  return trimmed.replace(/^https?:\/\//, "").split("/")[0].split(":")[0] || null;
}

export async function getBrandOverrideByHost(host: string | null | undefined): Promise<BrandOverride | null> {
  const normalizedHost = normalizeHost(host);
  if (!normalizedHost) return null;

  const workspace = await prisma.workspace.findFirst({
    where: { customDashboardDomain: normalizedHost },
    select: {
      id: true,
      name: true,
      customDashboardDomain: true,
      brandingLogo: true,
      brandingColors: true,
    },
  });

  if (!workspace?.customDashboardDomain) return null;

  const brandingColors = (workspace.brandingColors as Record<string, string> | null) ?? null;

  return {
    workspaceId: workspace.id,
    workspaceName: workspace.name,
    customDomain: workspace.customDashboardDomain,
    logoUrl: workspace.brandingLogo,
    colors: {
      primary: brandingColors?.primary,
      secondary: brandingColors?.secondary,
    },
  };
}

export async function resolveBrandOverrideFromRequest(): Promise<BrandOverride | null> {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") || headerStore.get("host");
  return getBrandOverrideByHost(host);
}
