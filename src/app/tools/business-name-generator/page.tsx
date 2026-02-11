import { FeatureDetailPage } from "@/components/marketing/FeatureDetailPage";

export default function BusinessNameGeneratorPage() {
  return (
    <FeatureDetailPage
      badge="AI Tool"
      title="Business"
      subtitle="Name Generator"
      description="Generate high-quality brand names aligned to your offer, audience, and market positioning. Build naming options with domain-readiness and messaging fit in mind."
      primaryCta={{ label: "Generate Name Ideas", href: "/onboarding" }}
      secondaryCta={{ label: "Check Domain Availability", href: "/services/domains" }}
      metrics={[
        { label: "Naming Angles", value: "Brand + SEO + Market" },
        { label: "Output Quality", value: "Human-review ready" },
        { label: "Validation Workflow", value: "Name to domain in one flow" },
      ]}
      pillars={[
        {
          title: "Audience-Aligned Naming",
          description:
            "Create names that reflect your category, tone, and differentiation strategy.",
        },
        {
          title: "Domain-Aware Suggestions",
          description:
            "Prioritize name options that can be validated quickly for digital brand launch viability.",
        },
        {
          title: "Decision Support",
          description:
            "Compare options by clarity, memorability, and long-term brand scalability.",
        },
      ]}
      workflow={[
        {
          title: "Define Brand Inputs",
          description:
            "Share your offer, audience, and values so suggestions are grounded in real strategy.",
        },
        {
          title: "Generate Candidate Sets",
          description:
            "Produce diversified options with clear naming rationale and positioning cues.",
        },
        {
          title: "Validate + Launch",
          description:
            "Shortlist your final options, secure the domain, and proceed into launch planning.",
        },
      ]}
    />
  );
}
