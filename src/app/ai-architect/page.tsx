import { FeatureDetailPage } from "@/components/marketing/FeatureDetailPage";

export default function AIArchitectPage() {
  return (
    <FeatureDetailPage
      badge="Platform Module"
      title="AI"
      subtitle="Architect"
      description="AI Architect converts your business goals into production-ready site maps, conversion flows, and component-level design guidance. It combines brand voice, SEO intent, and UX best practices into one structured workflow."
      primaryCta={{ label: "Run AI Architect", href: "/onboarding" }}
      secondaryCta={{ label: "Review Documentation", href: "/docs" }}
      metrics={[
        { label: "Planning Time Reduced", value: "74%" },
        { label: "Average Build Kickoff", value: "< 15 min" },
        { label: "Delivery Confidence", value: "95+ QA score" },
      ]}
      pillars={[
        {
          title: "Intent-Driven Site Mapping",
          description:
            "Generate page structures by business intent, including lead capture, trust layers, and sales enablement sections.",
        },
        {
          title: "Brand-Consistent Components",
          description:
            "Map your visual identity to reusable UI primitives so every page ships with a coherent, enterprise-grade layout.",
        },
        {
          title: "SEO + Conversion Alignment",
          description:
            "Pair keyword strategy with conversion design patterns, including CTA sequencing and trust signal placement.",
        },
      ]}
      workflow={[
        {
          title: "Ingest Business Context",
          description:
            "Capture audience, service lines, value propositions, and strategic outcomes to ground all design decisions.",
        },
        {
          title: "Generate Page Architecture",
          description:
            "Output a prioritized page map with section-level briefs, component types, and suggested copy direction.",
        },
        {
          title: "Activate Build Pipeline",
          description:
            "Send approved architecture into your publishing flow to produce deployable, editable website experiences.",
        },
      ]}
    />
  );
}
