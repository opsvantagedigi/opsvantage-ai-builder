import { FeatureDetailPage } from "@/components/marketing/FeatureDetailPage";

export default function ShowcasePage() {
  return (
    <FeatureDetailPage
      badge="Customer Outcomes"
      title="Customer"
      subtitle="Showcase"
      description="See how founders, agencies, and in-house teams use OpsVantage to ship polished digital experiences faster. Each showcase highlights measurable impact, launch velocity, and growth outcomes."
      primaryCta={{ label: "Start Your Project", href: "/onboarding" }}
      secondaryCta={{ label: "Explore Services", href: "/services/domains" }}
      metrics={[
        { label: "Industries Supported", value: "20+" },
        { label: "Average First Launch", value: "7 days" },
        { label: "Conversion Uplift", value: "18-42%" },
      ]}
      pillars={[
        {
          title: "Launch-Ready Foundations",
          description:
            "Projects start with strategy-backed page architecture and conversion-focused content structures.",
        },
        {
          title: "Design Consistency at Scale",
          description:
            "Brand systems and reusable modules keep quality high across teams, campaigns, and new service pages.",
        },
        {
          title: "Operational Visibility",
          description:
            "Analytics and change history help teams understand what shipped, why it shipped, and what to improve next.",
        },
      ]}
      workflow={[
        {
          title: "Review Benchmark Examples",
          description:
            "Study real builds for service businesses, SaaS teams, and multi-location brands.",
        },
        {
          title: "Select a Starting Blueprint",
          description:
            "Adopt a proven structure and tailor messaging, visuals, and calls to action for your audience.",
        },
        {
          title: "Launch + Optimize",
          description:
            "Deploy quickly and iterate with data-backed improvements for conversion and retention outcomes.",
        },
      ]}
    />
  );
}
