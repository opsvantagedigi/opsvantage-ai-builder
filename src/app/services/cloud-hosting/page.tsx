import { FeatureDetailPage } from "@/components/marketing/FeatureDetailPage";

export default function CloudHostingPage() {
  return (
    <FeatureDetailPage
      badge="Infrastructure"
      title="Cloud"
      subtitle="Hosting"
      description="Managed cloud hosting with auto-scaling runtimes, global edge delivery, and production observability. OpsVantage removes deployment friction so teams can focus on growth and customer experience."
      primaryCta={{ label: "Deploy on OpsVantage", href: "/onboarding" }}
      secondaryCta={{ label: "Read Hosting Docs", href: "/docs" }}
      metrics={[
        { label: "Global Edge Coverage", value: "Multi-region" },
        { label: "SSL + DNS Setup", value: "Guided in minutes" },
        { label: "Performance Monitoring", value: "Real-time" },
      ]}
      pillars={[
        {
          title: "Production-Ready Runtime",
          description:
            "Deploy websites to managed infrastructure tuned for predictable response times and resilience.",
        },
        {
          title: "Integrated Domain + SSL",
          description:
            "Connect domains and certificates without platform hopping or fragmented setup flows.",
        },
        {
          title: "Operations Visibility",
          description:
            "Track uptime, deploy events, and environment status through a single operational control plane.",
        },
      ]}
      workflow={[
        {
          title: "Provision Environment",
          description:
            "Create your project runtime with pre-configured environment and secure defaults.",
        },
        {
          title: "Attach Domain",
          description:
            "Map DNS, validate records, and issue certificates with guided checks.",
        },
        {
          title: "Monitor + Iterate",
          description:
            "Observe performance and deploy updates confidently through structured release flows.",
        },
      ]}
    />
  );
}
