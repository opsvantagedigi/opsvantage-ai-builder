import { FeatureDetailPage } from "@/components/marketing/FeatureDetailPage";

export default function LogoMakerPage() {
  return (
    <FeatureDetailPage
      badge="AI Tool"
      title="Logo"
      subtitle="Maker"
      description="Create logo concepts that align with your brand direction, audience perception, and website aesthetic. Build a visual identity system ready for web, social, and campaign use."
      primaryCta={{ label: "Create Logo Concepts", href: "/onboarding" }}
      secondaryCta={{ label: "See Brand Guidance", href: "/docs" }}
      metrics={[
        { label: "Concept Styles", value: "Wordmark to emblem" },
        { label: "Brand Fit", value: "Tone-calibrated options" },
        { label: "Usage Readiness", value: "Web + social friendly" },
      ]}
      pillars={[
        {
          title: "Identity-Led Design",
          description:
            "Generate concepts based on your market category, value proposition, and desired perception.",
        },
        {
          title: "Consistent Visual Language",
          description:
            "Align typography, icon direction, and color intent with your broader website system.",
        },
        {
          title: "Practical Delivery",
          description:
            "Evaluate options for legibility, scalability, and digital channel compatibility.",
        },
      ]}
      workflow={[
        {
          title: "Set Brand Direction",
          description:
            "Define mood, tone, and visual references that the generator should honor.",
        },
        {
          title: "Produce Concept Families",
          description:
            "Review multiple logo families with rationale and adaptation suggestions.",
        },
        {
          title: "Select + Apply",
          description:
            "Finalize an identity and apply it across your site and customer-facing assets.",
        },
      ]}
    />
  );
}
