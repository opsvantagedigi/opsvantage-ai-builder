import { FeatureDetailPage } from "@/components/marketing/FeatureDetailPage";

export default function EnterprisePage() {
  return (
    <FeatureDetailPage
      badge="Enterprise Suite"
      title="Enterprise"
      subtitle="Operations"
      description="OpsVantage Enterprise gives large teams governance, reliability, and security controls needed for multi-brand digital operations. Standardize workflows, enforce policy, and accelerate launch velocity without sacrificing compliance."
      primaryCta={{ label: "Talk to Enterprise Team", href: "/onboarding" }}
      secondaryCta={{ label: "View Pricing", href: "/pricing" }}
      metrics={[
        { label: "Supported Teams", value: "5-500 seats" },
        { label: "Operational Uptime", value: "99.9% target" },
        { label: "Provisioning Speed", value: "Minutes, not weeks" },
      ]}
      pillars={[
        {
          title: "Role-Based Governance",
          description:
            "Control access to projects, domains, and publishing workflows with clear ownership and approval boundaries.",
        },
        {
          title: "Policy-Ready Delivery",
          description:
            "Apply consistent templates, audit trails, and configuration guardrails aligned to ISO-style operational controls.",
        },
        {
          title: "Secure Platform Backbone",
          description:
            "Deploy on managed infrastructure with TLS, domain controls, and operational observability built in.",
        },
      ]}
      workflow={[
        {
          title: "Define Governance Model",
          description:
            "Set up teams, roles, permissions, and workspace structures based on your organization design.",
        },
        {
          title: "Standardize Build Patterns",
          description:
            "Create reusable page modules, brand kits, and approval workflows to enforce quality at scale.",
        },
        {
          title: "Operate with Confidence",
          description:
            "Ship updates faster while tracking ownership, historical changes, and platform health in one place.",
        },
      ]}
    />
  );
}
