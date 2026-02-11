import { useEffect, useMemo, useState } from "react";
import { OnboardingData } from "@/types/onboarding";

type Props = {
  onNext: (data: Partial<OnboardingData>) => Promise<void> | void;
  onSaveAndExit?: () => void;
  initialData?: OnboardingData;
  isSaving?: boolean;
};

const businessTypes = ["Startup", "SaaS", "Agency", "Ecommerce", "Professional Services", "Other"];
const industries = ["Technology", "Marketing", "Finance", "Healthcare", "Education", "Retail", "Other"];

export default function BusinessDetailsStep({ onNext, onSaveAndExit, initialData, isSaving }: Props) {
  const [businessName, setBusinessName] = useState(initialData?.businessName || "");
  const [businessType, setBusinessType] = useState(initialData?.businessType || "");
  const [industry, setIndustry] = useState(initialData?.industry || "");
  const [description, setDescription] = useState(initialData?.description || "");

  useEffect(() => {
    setBusinessName(initialData?.businessName || "");
    setBusinessType(initialData?.businessType || "");
    setIndustry(initialData?.industry || "");
    setDescription(initialData?.description || "");
  }, [initialData]);

  const isValid = useMemo(() => {
    return businessName.trim().length >= 2 && businessType.trim().length >= 2 && industry.trim().length >= 2;
  }, [businessName, businessType, industry]);

  const handleSubmit = () => {
    if (!isValid) {
      return;
    }

    void onNext({
      businessName: businessName.trim(),
      businessType: businessType.trim(),
      industry: industry.trim(),
      description: description.trim() || undefined,
    });
  };

  return (
    <article className="mx-auto max-w-3xl space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700 dark:text-cyan-300">Step 1 of 5</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">Business details</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Define your core company context so the AI can generate strategy and content based on real business inputs.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Business Name" htmlFor="businessName">
          <input
            id="businessName"
            value={businessName}
            onChange={(event) => setBusinessName(event.target.value)}
            placeholder="OpsVantage Digital"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-cyan-900/50"
          />
        </Field>

        <Field label="Business Type" htmlFor="businessType">
          <select
            id="businessType"
            value={businessType}
            onChange={(event) => setBusinessType(event.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-cyan-900/50"
          >
            <option value="">Select type</option>
            {businessTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Industry" htmlFor="industry">
          <select
            id="industry"
            value={industry}
            onChange={(event) => setIndustry(event.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-cyan-900/50"
          >
            <option value="">Select industry</option>
            {industries.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Business Summary" htmlFor="description">
          <textarea
            id="description"
            rows={4}
            maxLength={300}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Describe your services, value proposition, and target outcomes."
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-cyan-900/50"
          />
        </Field>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onSaveAndExit}
          className="button-secondary !px-4 !py-2"
        >
          Save & Exit
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isValid || isSaving}
          className="button-primary !px-5 !py-2 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSaving ? "Saving..." : "Continue"}
        </button>
      </div>
    </article>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="space-y-1 text-sm font-medium text-slate-700 dark:text-slate-200">
      <span>{label}</span>
      {children}
    </label>
  );
}