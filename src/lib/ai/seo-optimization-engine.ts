import type { OnboardingData } from "@/types/onboarding";

type GeneratedSection = {
  heading?: string;
  body?: string;
  items?: Array<{ title?: string; description?: string }>;
};

type GeneratedPageLike = {
  title: string;
  slug: string;
  metaDescription?: string;
  sections?: GeneratedSection[];
};

export type SeoOptimizationResult = {
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  keywords: string[];
  openGraph: {
    title: string;
    description: string;
    type: "website";
  };
  structuredData: Record<string, unknown>;
  preindexHints: {
    robots: string;
    priority: number;
    changeFrequency: "daily" | "weekly" | "monthly";
  };
};

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim();
}

function dedupe(values: string[]): string[] {
  const seen = new Set<string>();
  const output: string[] = [];
  for (const value of values) {
    const normalized = normalize(value);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    output.push(value.trim());
  }
  return output;
}

function truncate(text: string, maxLength: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

function collectSectionText(sections: GeneratedSection[] = []): string {
  const fragments: string[] = [];
  for (const section of sections) {
    if (section.heading) fragments.push(section.heading);
    if (section.body) fragments.push(section.body);
    for (const item of section.items ?? []) {
      if (item.title) fragments.push(item.title);
      if (item.description) fragments.push(item.description);
    }
  }
  return fragments.join(" ");
}

function extractKeywordCandidates(page: GeneratedPageLike, onboarding: Partial<OnboardingData>): string[] {
  const source = [
    page.title,
    page.slug.replace(/-/g, " "),
    page.metaDescription ?? "",
    collectSectionText(page.sections),
    onboarding.businessName ?? "",
    onboarding.industry ?? "",
    onboarding.businessType ?? "",
    onboarding.targetAudience ?? "",
    onboarding.goals ?? "",
  ]
    .join(" ")
    .toLowerCase();

  const tokens = source
    .split(/[^a-z0-9]+/g)
    .filter((token) => token.length >= 4)
    .filter((token) => !["with", "that", "this", "from", "your", "have", "will", "into", "than", "they", "them", "their", "about"].includes(token));

  const frequencies = new Map<string, number>();
  for (const token of tokens) {
    frequencies.set(token, (frequencies.get(token) ?? 0) + 1);
  }

  const ranked = Array.from(frequencies.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([token]) => token);

  const primary = dedupe([
    onboarding.businessName ?? "",
    onboarding.industry ?? "",
    onboarding.businessType ?? "",
    ...ranked,
  ]).filter(Boolean);

  return primary.slice(0, 8);
}

export function buildSeoOptimization(page: GeneratedPageLike, onboarding: Partial<OnboardingData>, siteUrl: string): SeoOptimizationResult {
  const businessName = onboarding.businessName?.trim() || "OpsVantage";
  const industry = onboarding.industry?.trim() || onboarding.businessType?.trim() || "digital services";
  const canonicalUrl = `${siteUrl.replace(/\/$/, "")}/${page.slug.replace(/^\//, "")}`;

  const rawTitle = `${page.title} | ${businessName}`;
  const metaTitle = truncate(rawTitle, 60);

  const fallbackDescription = `${page.title} for ${industry}. Built for ${onboarding.targetAudience || "growth-focused teams"} with conversion-ready copy and enterprise performance.`;
  const baseDescription = page.metaDescription?.trim() || fallbackDescription;
  const metaDescription = truncate(baseDescription, 160);

  const keywords = extractKeywordCandidates(page, onboarding);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.title,
    description: metaDescription,
    url: canonicalUrl,
    about: industry,
    isPartOf: {
      "@type": "WebSite",
      name: businessName,
      url: siteUrl,
    },
    keywords,
  };

  return {
    metaTitle,
    metaDescription,
    canonicalUrl,
    keywords,
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      type: "website",
    },
    structuredData,
    preindexHints: {
      robots: "index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1",
      priority: page.slug === "home" ? 1 : 0.8,
      changeFrequency: page.slug === "home" ? "daily" : "weekly",
    },
  };
}

export function optimizeGeneratedPageSeo<T extends GeneratedPageLike>(params: {
  page: T;
  onboarding?: Partial<OnboardingData>;
  siteUrl?: string;
}): T & { seo: SeoOptimizationResult; metaDescription: string } {
  const onboarding = params.onboarding ?? {};
  const siteUrl = params.siteUrl || process.env.NEXT_PUBLIC_APP_URL || "https://opsvantagedigital.online";
  const seo = buildSeoOptimization(params.page, onboarding, siteUrl);

  return {
    ...params.page,
    metaDescription: seo.metaDescription,
    seo,
  };
}
