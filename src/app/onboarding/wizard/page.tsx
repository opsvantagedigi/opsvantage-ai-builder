import { FeatureDetailPage } from "@/components/marketing/FeatureDetailPage";

export default function OnboardingWizardPage() {
  return (
    <FeatureDetailPage
      badge="Guided Build"
      title="Launch"
      subtitle="Wizard"
      description="The Launch Wizard turns business context into a publish-ready website blueprint. It guides you through strategy, positioning, visual direction, and domain setup in one structured flow."
      primaryCta={{ label: "Open Launch Wizard", href: "/onboarding" }}
      secondaryCta={{ label: "See Platform Docs", href: "/docs" }}
      metrics={[
        { label: "Guided Steps", value: "6-step process" },
        { label: "Average Completion", value: "< 20 minutes" },
        { label: "Output", value: "Deploy-ready brief" },
      ]}
      pillars={[
        {
          title: "Business Discovery",
          description:
            "Capture goals, audience, and services to anchor architecture and messaging.",
        },
        {
          title: "Brand Direction",
          description:
            "Set visual and copy preferences that influence generated page structure and style.",
        },
        {
          title: "Launch Preparation",
          description:
            "Connect domain and publishing preferences before handing off to deployment.",
        },
      ]}
      workflow={[
        {
          title: "Complete Guided Inputs",
          description:
            "Follow each step to define what your website must communicate and achieve.",
        },
        {
          title: "Review AI Recommendations",
          description:
            "Validate generated structure, copy themes, and conversion flow direction.",
        },
        {
          title: "Proceed to Deployment",
          description:
            "Approve and move into domain, publishing, and operations setup.",
        },
      ]}
    />
  );
}
