import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-config";

const staticRoutes = [
  "/",
  "/home",
  "/coming-soon",
  "/pricing",
  "/docs",
  "/ai-architect",
  "/enterprise",
  "/showcase",
  "/services/domains",
  "/services/cloud-hosting",
  "/services/professional-email",
  "/services/ssl-security",
  "/tools/business-name-generator",
  "/tools/logo-maker",
  "/tools/slogan-ai",
  "/onboarding",
  "/onboarding/wizard",
  "/legal",
  "/privacy",
  "/terms",
  "/security",
  "/legal/privacy",
  "/legal/terms",
  "/legal/security",
  "/login",
  "/register",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return staticRoutes.map((route, index) => ({
    url: `${SITE_URL}${route}`,
    lastModified: now,
    changeFrequency: route === "/" ? "daily" : "weekly",
    priority: index === 0 ? 1 : 0.7,
  }));
}
