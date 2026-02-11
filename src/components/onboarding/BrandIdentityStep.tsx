import { useEffect, useMemo, useState } from "react";
import { OnboardingData } from "@/types/onboarding";

type Props = {
  onNext: (data: Partial<OnboardingData>) => Promise<void> | void;
  onBack?: () => void;
  onSaveAndExit?: () => void;
  initialData?: OnboardingData;
  isSaving?: boolean;
};

const voicePresets = ["Authoritative", "Friendly", "Technical", "Premium", "Bold", "Minimal"];

export default function BrandIdentityStep({ onNext, onBack, onSaveAndExit, initialData, isSaving }: Props) {
  const [brandVoice, setBrandVoice] = useState(initialData?.brandVoice || "");
  const [targetAudience, setTargetAudience] = useState(initialData?.targetAudience || "");

  useEffect(() => {
    setBrandVoice(initialData?.brandVoice || "");
    setTargetAudience(initialData?.targetAudience || "");
  }, [initialData]);

  const isValid = useMemo(() => {
    return brandVoice.trim().length >= 2 && targetAudience.trim().length >= 2;
  }, [brandVoice, targetAudience]);

  const handleSubmit = () => {
    if (!isValid) {
      return;
    }

    void onNext({
      brandVoice: brandVoice.trim(),
      targetAudience: targetAudience.trim(),
    });
  };

  return (
    <article className="mx-auto max-w-3xl space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700 dark:text-cyan-300">Step 2 of 5</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">Brand identity</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Define brand voice and audience focus so generated pages align with your positioning and buyer expectations.
        </p>
      </div>

      <div className="space-y-4">
        <label htmlFor="brandVoice" className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          Brand Voice
          <input
            id="brandVoice"
            value={brandVoice}
            onChange={(event) => setBrandVoice(event.target.value)}
            placeholder="Authoritative and practical"
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-cyan-900/50"
          />
        </label>

        <div className="flex flex-wrap gap-2">
          {voicePresets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setBrandVoice(preset)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                brandVoice === preset
                  ? "border-cyan-500 bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-200"
                  : "border-slate-300 text-slate-600 hover:border-slate-400 dark:border-slate-700 dark:text-slate-300"
              }`}
            >
              {preset}
            </button>
          ))}
        </div>

        <label htmlFor="targetAudience" className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          Target Audience
          <textarea
            id="targetAudience"
            rows={4}
            value={targetAudience}
            onChange={(event) => setTargetAudience(event.target.value)}
            placeholder="Founders and growth teams running digital operations with lean internal resources."
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-cyan-900/50"
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button type="button" onClick={onBack} className="button-secondary !px-4 !py-2">
            Back
          </button>
          <button type="button" onClick={onSaveAndExit} className="button-secondary !px-4 !py-2">
            Save & Exit
          </button>
        </div>

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