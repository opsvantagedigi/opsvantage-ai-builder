"use client";

import { useMemo, useState } from "react";
import { Loader2, ArrowRight, CheckCircle, Sparkles } from "lucide-react";

type ServiceKey = "domains" | "ssl" | "server" | "security";

type NeedsState = Record<ServiceKey, boolean>;

// Define the state for the current step in the wizard
type WizardStep = "intro" | "projectType" | "needsAssessment" | "addOns" | "services" | "review";

const serviceOptions: { key: ServiceKey; label: string; description: string; insight: string }[] = [
  { 
    key: "domains", 
    label: "Domain Registration", 
    description: "Secure your brand identity with the perfect domain name", 
    insight: "Every digital presence starts with a memorable domain. Choose wisely as it becomes your brand's digital address." 
  },
  { 
    key: "ssl", 
    label: "SSL Certificates", 
    description: "Encrypt data transmission and build visitor trust", 
    insight: "Essential for security and SEO. Without SSL, browsers will flag your site as 'Not Secure'." 
  },
  { 
    key: "server", 
    label: "Cloud Hosting", 
    description: "Reliable infrastructure for optimal performance", 
    insight: "Your foundation for speed, uptime, and scalability. Choose based on traffic projections." 
  },
  { 
    key: "security", 
    label: "Advanced Security", 
    description: "Comprehensive protection against threats", 
    insight: "Beyond basic SSL, consider spam filtering, malware scanning, and DDoS protection." 
  },
];

export function InfrastructureWizard() {
  const [currentStep, setCurrentStep] = useState<WizardStep>("intro");
  const [projectType, setProjectType] = useState("saas");
  const [needs, setNeeds] = useState<NeedsState>({ domains: true, ssl: true, server: false, security: false });
  const [selectedService, setSelectedService] = useState<ServiceKey>("domains");
  const [domainOrEmail, setDomainOrEmail] = useState("");
  const [serviceData, setServiceData] = useState<Array<Record<string, unknown>>>([]);
  const [securityUrl, setSecurityUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<{name: string, price: number}[]>([]);

  // Calculate total build cost in real-time
  const totalCost = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price, 0);
  }, [cartItems]);

  // Determine recommended add-ons based on selections
  const recommended = useMemo(() => {
    const base: string[] = [];

    if (needs.domains) base.push("Domain search and claim setup");
    if (needs.ssl) base.push("Managed SSL package selection");
    if (needs.server) base.push("Server license and hosting footprint review");
    if (needs.security) base.push("Spam filtering security onboarding");

    if (projectType === "ecommerce" && !base.includes("Managed SSL package selection")) {
      base.push("Managed SSL package selection");
    }

    // Conditional recommendations based on user selections
    if (needs.domains && !needs.ssl) {
      base.push("SSL Certificate (recommended after domain selection)");
    }
    if (projectType === "ecommerce" && !needs.security) {
      base.push("Advanced Security Package (essential for e-commerce)");
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

  // Function to add an item to the cart
  const addToStack = (itemName: string, price: number) => {
    setCartItems(prev => [...prev, { name: itemName, price }]);
  };

  // Render the current step of the wizard
  const renderStep = () => {
    switch(currentStep) {
      case "intro":
        return (
          <div className="text-center py-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-500">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-slate-100">Welcome to Your Infrastructure Journey</h3>
            <p className="mt-2 text-slate-600 dark:text-slate-300 max-w-md mx-auto">
              I'm your AI Architect. I'll guide you through selecting the right infrastructure for your project.
            </p>
            <button
              onClick={() => setCurrentStep("projectType")}
              className="mt-6 inline-flex items-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Begin Assessment <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        );
      
      case "projectType":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">What type of project are you building?</h3>
              <p className="mt-2 text-slate-600 dark:text-slate-300">
                Understanding your project helps me recommend the right infrastructure.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { value: "saas", label: "SaaS Application", desc: "Software as a Service with recurring revenue" },
                { value: "ecommerce", label: "E-commerce Store", desc: "Online store with transaction processing" },
                { value: "agency", label: "Agency Website", desc: "Portfolio and client showcase site" },
                { value: "portfolio", label: "Personal Portfolio", desc: "Professional showcase site" },
              ].map((option) => (
                <div 
                  key={option.value}
                  className={`rounded-xl border p-4 cursor-pointer transition-all ${
                    projectType === option.value 
                      ? "border-cyan-500 bg-cyan-50/50 dark:bg-cyan-500/10" 
                      : "border-slate-200 dark:border-slate-700 hover:border-cyan-300"
                  }`}
                  onClick={() => setProjectType(option.value)}
                >
                  <div className="flex items-center">
                    <div className={`mr-3 flex h-5 w-5 items-center justify-center rounded-full border ${
                      projectType === option.value 
                        ? "border-cyan-500 bg-cyan-500" 
                        : "border-slate-300 dark:border-slate-600"
                    }`}>
                      {projectType === option.value && <CheckCircle className="h-4 w-4 text-white" />}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{option.label}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{option.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between pt-4">
              <button
                onClick={() => setCurrentStep("intro")}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep("needsAssessment")}
                className="inline-flex items-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        );
      
      case "needsAssessment":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">What infrastructure do you need?</h3>
              <p className="mt-2 text-slate-600 dark:text-slate-300">
                Select the services that align with your project requirements.
              </p>
            </div>
            
            <div className="space-y-4">
              {serviceOptions.map((service) => (
                <div 
                  key={service.key}
                  className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"
                >
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={needs[service.key]}
                      onChange={(event) =>
                        setNeeds((prev) => ({
                          ...prev,
                          [service.key]: event.target.checked,
                        }))
                      }
                      className="mt-1 h-5 w-5 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 dark:border-slate-600 dark:bg-slate-800"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-slate-900 dark:text-slate-100">{service.label}</h4>
                      </div>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{service.description}</p>
                      
                      {/* Architect Insight Bubble */}
                      <div className="mt-3 rounded-lg border-l-4 border-cyan-500 bg-cyan-50/50 p-3 dark:bg-cyan-500/10">
                        <div className="flex items-start">
                          <Sparkles className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-600 dark:text-cyan-400" />
                          <p className="text-sm text-slate-700 dark:text-slate-300">
                            <span className="font-medium text-cyan-700 dark:text-cyan-300">Architect Insight:</span> {service.insight}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between pt-4">
              <button
                onClick={() => setCurrentStep("projectType")}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep("addOns")}
                className="inline-flex items-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        );
      
      case "addOns":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Recommended Add-ons</h3>
              <p className="mt-2 text-slate-600 dark:text-slate-300">
                Based on your selections, here are some recommended additions.
              </p>
            </div>
            
            <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Suggested Add-ons</p>
              <ul className="mt-2 space-y-2">
                {recommended.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="mr-2 mt-0.5 h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-slate-700 dark:text-slate-200">{item}</span>
                  </li>
                ))}
              </ul>
              
              {/* Show conditional add-on suggestions */}
              {needs.domains && !needs.ssl && (
                <div className="mt-4 rounded-lg border-l-4 border-green-500 bg-green-50/50 p-3 dark:bg-green-500/10">
                  <p className="text-sm text-green-700 dark:text-green-300">
                    <span className="font-medium">💡 Pro Tip:</span> Since you selected a domain, consider adding SSL for security and SEO benefits.
                  </p>
                  <button 
                    onClick={() => {
                      setNeeds(prev => ({...prev, ssl: true}));
                      addToStack("SSL Certificate", 89.99);
                    }}
                    className="mt-2 inline-flex items-center rounded-lg bg-green-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-green-600"
                  >
                    Add SSL to Stack
                  </button>
                </div>
              )}
              
              {projectType === "ecommerce" && !needs.security && (
                <div className="mt-4 rounded-lg border-l-4 border-amber-500 bg-amber-50/50 p-3 dark:bg-amber-500/10">
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    <span className="font-medium">⚠️ Security Alert:</span> E-commerce sites require advanced security measures for PCI compliance.
                  </p>
                  <button 
                    onClick={() => {
                      setNeeds(prev => ({...prev, security: true}));
                      addToStack("Advanced Security Package", 149.99);
                    }}
                    className="mt-2 inline-flex items-center rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-amber-600"
                  >
                    Add Security to Stack
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex justify-between pt-4">
              <button
                onClick={() => setCurrentStep("needsAssessment")}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep("services")}
                className="inline-flex items-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        );
      
      case "services":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Explore Available Services</h3>
              <p className="mt-2 text-slate-600 dark:text-slate-300">
                Browse our infrastructure services and add them to your stack.
              </p>
            </div>
            
            <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
              <div className="flex flex-col gap-3 md:flex-row">
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
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-70"
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
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {serviceData.slice(0, 6).map((item, index) => (
                    <div key={`${selectedService}-${index}`} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-base font-semibold text-slate-900 dark:text-slate-100">{String(item.name || item.title || item.brand_name || "Service item")}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{String(item.category || item.product || item.status || "OpenProvider data")}</p>
                        </div>
                        <span className="text-sm font-bold text-green-600 dark:text-green-400">${item.price || "TBD"}/year</span>
                      </div>
                      <button 
                        onClick={() => addToStack(String(item.name || item.title || "Service"), Number(item.price) || 0)}
                        className="mt-3 w-full rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-3 py-2 text-xs font-medium text-white transition hover:opacity-90"
                      >
                        Add to Stack
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex justify-between pt-4">
              <button
                onClick={() => setCurrentStep("addOns")}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep("review")}
                className="inline-flex items-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Review Stack <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        );
      
      case "review":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Your Infrastructure Stack</h3>
              <p className="mt-2 text-slate-600 dark:text-slate-300">
                Review your selections before finalizing your infrastructure.
              </p>
            </div>
            
            <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">Build Cost Summary</h4>
                <span className="text-xl font-bold text-cyan-600 dark:text-cyan-400">${totalCost.toFixed(2)}</span>
              </div>
              
              {cartItems.length > 0 ? (
                <ul className="space-y-3">
                  {cartItems.map((item, index) => (
                    <li key={index} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700">
                      <span className="text-slate-700 dark:text-slate-300">{item.name}</span>
                      <span className="font-medium text-green-600 dark:text-green-400">${item.price.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center py-4 text-slate-500 dark:text-slate-400">No items in your stack yet. Add services to see the cost breakdown.</p>
              )}
            </div>
            
            <div className="flex justify-between pt-4">
              <button
                onClick={() => setCurrentStep("services")}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Back
              </button>
              <button
                onClick={() => alert("Infrastructure stack finalized! This would connect to your order system.")}
                className="inline-flex items-center rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Finalize Stack
              </button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="surface-card p-6 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700 dark:text-cyan-300">AI Infrastructure Architect</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">Needs-Based Wizard</h2>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500 dark:text-slate-400">Build Cost</p>
          <p className="text-lg font-bold text-cyan-600 dark:text-cyan-400">${totalCost.toFixed(2)}</p>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="mt-6 flex items-center">
        {(["intro", "projectType", "needsAssessment", "addOns", "services", "review"] as WizardStep[]).map((step, index) => (
          <div key={step} className="flex items-center">
            <div 
              className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                currentStep === step 
                  ? "bg-cyan-500 text-white" 
                  : index < (["intro", "projectType", "needsAssessment", "addOns", "services", "review"].indexOf(currentStep as any) || 0) 
                    ? "bg-green-500 text-white" 
                    : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
              }`}
            >
              {index < (["intro", "projectType", "needsAssessment", "addOns", "services", "review"].indexOf(currentStep as any) || 0) ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                index + 1
              )}
            </div>
            {index < 5 && <div className="h-1 w-16 bg-slate-200 dark:bg-slate-700"></div>}
          </div>
        ))}
      </div>

      {/* Wizard content */}
      <div className="mt-6">
        {renderStep()}
      </div>
    </div>
  );
}
