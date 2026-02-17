import type { Metadata } from "next";
import { headers } from "next/headers";

import { RenderEngine } from "@/components/builder/render-engine";
import { db } from "@/lib/db";
import { optimizeGeneratedPageSeo } from "@/lib/ai/seo-optimization-engine";

type RouteParams = {
  params: {
    siteId: string;
  };
};

type SiteData = {
  siteConfig?: {
    title?: string;
    description?: string;
    theme?: string;
  };
  pages?: Array<{
    id?: string;
    name?: string;
    sections?: Array<{ id: string; type: string; content: Record<string, unknown> }>;
    seo?: unknown;
    metaDescription?: string;
    title?: string;
    slug?: string;
  }>;
};

function normalizeHost(value: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return null;
  return trimmed.split(":")[0] || null;
}

async function fetchPublishedSite(siteId: string): Promise<SiteData | null> {
  const project = await db.project.findFirst({
    where: {
      OR: [{ subdomain: siteId }, { customDomain: siteId }],
      published: true,
    },
    select: {
      content: true,
    },
  });

  if (!project?.content) return null;
  return project.content as unknown as SiteData;
}

async function getCanonicalUrl(siteId: string): Promise<string> {
  const headerStore = await headers();
  const host = normalizeHost(headerStore.get("x-forwarded-host") || headerStore.get("host"));

  // If requests are rewritten from a custom domain, the host is the true canonical.
  if (host && host !== "localhost") {
    return `https://${host}`;
  }

  // Fallback (direct access /sites/{id})
  const base = process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://opsvantagedigital.online";
  return `${base.replace(/\/$/, "")}/sites/${encodeURIComponent(siteId)}`;
}

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const siteId = params.siteId;
  const siteData = await fetchPublishedSite(siteId);
  if (!siteData?.siteConfig) {
    return {
      title: "Site Not Found",
      robots: { index: false, follow: false },
    };
  }

  const canonicalUrl = await getCanonicalUrl(siteId);

  const rawTitle = siteData.siteConfig.title?.trim() || "Untitled Site";
  const rawDescription = siteData.siteConfig.description?.trim() || "";

  const pageLike = {
    title: rawTitle,
    slug: "home",
    metaDescription: rawDescription,
    sections: (siteData.pages?.[0]?.sections || []).map((section) => ({
      heading: typeof section.content?.headline === "string" ? (section.content.headline as string) : undefined,
      body: typeof section.content?.subheadline === "string" ? (section.content.subheadline as string) : undefined,
      items: Array.isArray(section.content?.items)
        ? (section.content.items as Array<{ title?: string; description?: string }>).map((item) => ({
            title: item?.title,
            description: item?.description,
          }))
        : undefined,
    })),
  };

  const optimized = optimizeGeneratedPageSeo({
    page: pageLike,
    onboarding: {},
    siteUrl: canonicalUrl,
  });

  return {
    title: optimized.seo.metaTitle,
    description: optimized.seo.metaDescription,
    alternates: {
      canonical: optimized.seo.canonicalUrl,
    },
    keywords: optimized.seo.keywords,
    openGraph: {
      title: optimized.seo.openGraph.title,
      description: optimized.seo.openGraph.description,
      url: optimized.seo.canonicalUrl,
      type: "website",
    },
    robots: optimized.seo.preindexHints.robots,
  };
}

export default async function SitePage({ params }: RouteParams) {
  const siteId = params.siteId;
  const siteData = await fetchPublishedSite(siteId);

  if (!siteData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Site Not Found</h1>
          <p className="text-gray-600 mb-6">
            The site you are looking for does not exist or has not been published yet.
          </p>
          <div className="text-sm text-gray-500">
            <p>Site ID: {siteId}</p>
          </div>
        </div>
      </div>
    );
  }

  const sections = siteData.pages?.[0]?.sections || [];

  return <RenderEngine sections={sections as any} />;
}
