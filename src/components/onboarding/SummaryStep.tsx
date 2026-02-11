import { OnboardingData } from "@/types/onboarding";

type Props = {
  onBack?: () => void;
  onGenerate: () => void;
  formData?: OnboardingData;
  isSaving?: boolean;
};

export default function SummaryStep({ onBack, onGenerate, formData, isSaving }: Props) {
  const reviewItems = [
    { label: "Business Name", value: formData?.businessName || "Not provided" },
    { label: "Business Type", value: formData?.businessType || "Not provided" },
    { label: "Industry", value: formData?.industry || "Not provided" },
    { label: "Brand Voice", value: formData?.brandVoice || "Not provided" },
    { label: "Target Audience", value: formData?.targetAudience || "Not provided" },
    { label: "Primary Goals", value: formData?.goals || "Not provided" },
    {
      label: "Competitors",
      value: formData?.competitors && formData.competitors.length > 0 ? formData.competitors.join(", ") : "None added",
    },
    {
      label: "Color Palette",
      value: formData?.colorPalette && formData.colorPalette.length > 0 ? formData.colorPalette.join(", ") : "Not provided",
    },
    { label: "Design Style", value: formData?.designStyle || "Not provided" },
  ];

  return (
    <article className="mx-auto max-w-3xl space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700 dark:text-cyan-300">Step 5 of 5</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">Review and generate</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Confirm your strategy inputs before generating the first deploy-ready architecture for your website.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {reviewItems.map((item) => (
              <tr key={item.label}>
                <td className="w-48 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                  {item.label}
                </td>
                <td className="px-4 py-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={onBack} className="button-secondary !px-4 !py-2">
          Back
        </button>
        <button
          type="button"
          onClick={onGenerate}
          disabled={isSaving}
          className="button-primary !px-5 !py-2 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSaving ? "Generating..." : "Generate Website Blueprint"}
        </button>
      </div>
    </article>
  );
}