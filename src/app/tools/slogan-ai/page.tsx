import { FeatureDetailPage } from "@/components/marketing/FeatureDetailPage";

export default function SloganAIPage() {
  return (
    <FeatureDetailPage
      badge="AI Tool"
      title="Slogan"
      subtitle="Generator"
      description="Generate messaging hooks, value-based headlines, and campaign taglines that are concise, credible, and aligned to your brand promise."
      primaryCta={{ label: "Generate Slogans", href: "/onboarding" }}
      secondaryCta={{ label: "View Pricing", href: "/pricing" }}
      metrics={[
        { label: "Messaging Variants", value: "50+ in one run" },
        { label: "Tone Controls", value: "Professional to bold" },
        { label: "Conversion Focus", value: "CTA-ready wording" },
      ]}
      pillars={[
        {
          title: "Strategic Message Framing",
          description:
            "Translate product value into concise statements customers can remember and trust.",
        },
        {
          title: "Audience-Centered Copy",
          description:
            "Generate variations calibrated for founders, teams, agencies, and enterprise buyers.",
        },
        {
          title: "Campaign Ready Output",
          description:
            "Use generated lines across hero sections, ads, social posts, and nurture sequences.",
        },
      ]}
      workflow={[
        {
          title: "Define Offer + Audience",
          description:
            "Provide context on your service, positioning, and customer pain points.",
        },
        {
          title: "Generate Variations",
          description:
            "Review punchy, premium, and practical copy options with different tonal directions.",
        },
        {
          title: "Publish Across Channels",
          description:
            "Deploy approved messaging into your site, landing pages, and outbound campaigns.",
        },
      ]}
    />
  );
}
