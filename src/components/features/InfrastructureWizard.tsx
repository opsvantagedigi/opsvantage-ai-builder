"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

type ServiceKey = "domains" | "ssl" | "server" | "security";

type NeedsState = Record<ServiceKey, boolean>;

const serviceOptions: { key: ServiceKey; label: string; description: string }[] = [
  { key: "domains", label: "Domains", description: "Live check and registration readiness" },
  { key: "ssl", label: "SSL Certificates", description: "Live product retrieval from OpenProvider" },
  { key: "server", label: "Server Management", description: "Plesk/Virtuozzo license coverage" },
  { key: "security", label: "Security", description: "SpamExpert login URL generation" },
];

export function InfrastructureWizard() {
  const [projectType, setProjectType] = useState("saas");
  const [needs, setNeeds] = useState<NeedsState>({ domains: true, ssl: true, server: false, security: false });
  const [selectedService, setSelectedService] = useState<ServiceKey>("domains");
  const [domainOrEmail, setDomainOrEmail] = useState("");
  const [serviceData, setServiceData] = useState<Array<Record<string, unknown>>>([]);
  const [securityUrl, setSecurityUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recommended = useMemo(() => {
    const base: string[] = [];

    if (needs.domains) base.push("Domain search and claim setup");
    if (needs.ssl) base.push("Managed SSL package selection");
    if (needs.server) base.push("Server license and hosting footprint review");
    if (needs.security) base.push("Spam filtering security onboarding");

    if (projectType === "ecommerce" && !base.includes("Managed SSL package selection")) {
      base.push("Managed SSL package selection");
    }

    return base;
  }, [needs, projectType]);

  const loadServiceData = async () => {
    setLoading(true);
    setError(null);
    setSecurityUrl(null);

    try {
      if (selectedService === "security") {
        if (!domainOrEmail.trim()) {
          setError("Enter a domain or mailbox to generate the SpamExpert login URL.");
          return;
        }

        const response = await fetch("/api/infrastructure/services", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ service: "security", domainOrEmail: domainOrEmail.trim() }),
        });
        const payload = (await response.json()) as { url?: string; error?: string };

        if (payload.error) {
          setError(payload.error);
          return;
        }

        setSecurityUrl(payload.url || null);
        setServiceData([]);
        return;
      }

      if (selectedService === "domains") {
        setServiceData([]);
        return;
      }

      const response = await fetch(`/api/infrastructure/services?service=${selectedService}`);
      const payload = (await response.json()) as { items?: Array<Record<string, unknown>>; error?: string };

      if (payload.error) {
        setError(payload.error);
        return;
      }

      setServiceData(payload.items || []);
    } catch {
      setError("Unable to load service data right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="surface-card p-6 md:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700 dark:text-cyan-300">Infrastructure Wizard</p>
      <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">Needs-Based Infrastructure Assistant</h2>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Step 1 · Project Type</p>
          <select
            value={projectType}
            onChange={(event) => setProjectType(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          >
            <option value="saas">SaaS</option>
            <option value="ecommerce">E-commerce</option>
            <option value="agency">Agency</option>
            <option value="portfolio">Portfolio</option>
          </select>
        </div>

        <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700 md:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Step 2 · Add-on Needs</p>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {serviceOptions.map((service) => (
              <label key={service.key} className="flex items-start gap-2 rounded-lg border border-slate-200 p-2.5 dark:border-slate-700">
                <input
                  type="checkbox"
                  checked={needs[service.key]}
                  onChange={(event) =>
                    setNeeds((prev) => ({
                      ...prev,
                      [service.key]: event.target.checked,
                    }))
                  }
                  className="mt-1"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{service.label}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{service.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Step 3 · Suggested Add-ons</p>
        <ul className="mt-2 space-y-1">
          {recommended.map((item) => (
            <li key={item} className="text-sm text-slate-700 dark:text-slate-200">• {item}</li>
          ))}
        </ul>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Services</p>
        <div className="mt-3 flex flex-col gap-3 md:flex-row">
          <select
            value={selectedService}
            onChange={(event) => setSelectedService(event.target.value as ServiceKey)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          >
            {serviceOptions.map((service) => (
              <option key={service.key} value={service.key}>
                {service.label}
              </option>
            ))}
          </select>

          {selectedService === "security" && (
            <input
              type="text"
              value={domainOrEmail}
              onChange={(event) => setDomainOrEmail(event.target.value)}
              placeholder="example.com or admin@example.com"
              className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            />
          )}

          <button
            type="button"
            onClick={() => void loadServiceData()}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-70 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Load Service"}
          </button>
        </div>

        {error && <p className="mt-3 text-sm text-red-600 dark:text-red-300">{error}</p>}

        {selectedService === "domains" && (
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            Domain checks are live in the search bar above via OpenProvider `domains/check`.
          </p>
        )}

        {securityUrl && (
          <a
            href={securityUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex text-sm font-semibold text-cyan-700 hover:text-cyan-800 dark:text-cyan-300 dark:hover:text-cyan-200"
          >
            Open SpamExpert Login URL
          </a>
        )}

        {serviceData.length > 0 && (
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {serviceData.slice(0, 6).map((item, index) => (
              <div key={`${selectedService}-${index}`} className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{String(item.name || item.title || item.brand_name || "Service item")}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{String(item.category || item.product || item.status || "OpenProvider data")}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
