import { FeatureDetailPage } from "@/components/marketing/FeatureDetailPage";

export default function ProfessionalEmailPage() {
  return (
    <FeatureDetailPage
      badge="Communication"
      title="Professional"
      subtitle="Email"
      description="Launch branded email addresses for teams and client accounts with secure provisioning, mailbox governance, and reliable deliverability foundations."
      primaryCta={{ label: "Set Up Business Email", href: "/onboarding" }}
      secondaryCta={{ label: "Explore Plans", href: "/pricing" }}
      metrics={[
        { label: "Mailbox Provisioning", value: "Same-day setup" },
        { label: "Brand Trust", value: "Custom domain inboxes" },
        { label: "Operational Control", value: "Admin-managed" },
      ]}
      pillars={[
        {
          title: "Domain-Branded Identity",
          description:
            "Replace generic addresses with verified business inboxes that reinforce trust in every customer interaction.",
        },
        {
          title: "Secure Admin Controls",
          description:
            "Manage users, aliases, and access rules with clear ownership and account lifecycle governance.",
        },
        {
          title: "Reliable Sending Posture",
          description:
            "Support authentication standards and sender reputation practices to improve inbox placement.",
        },
      ]}
      workflow={[
        {
          title: "Connect Domain",
          description:
            "Verify ownership and configure required records to activate secure email capabilities.",
        },
        {
          title: "Create Team Mailboxes",
          description:
            "Provision role-based inboxes for sales, support, operations, and leadership.",
        },
        {
          title: "Maintain Deliverability",
          description:
            "Monitor sender posture, audit account usage, and keep communication channels reliable.",
        },
      ]}
    />
  );
}
