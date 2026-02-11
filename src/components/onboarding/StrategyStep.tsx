import { useEffect, useMemo, useState } from "react";
import { OnboardingData } from "@/types/onboarding";

type Props = {
  onNext: (data: Partial<OnboardingData>) => Promise<void> | void;
  onBack?: () => void;
  onSaveAndExit?: () => void;
  initialData?: OnboardingData;
  isSaving?: boolean;
};

export default function StrategyStep({ onNext, onBack, onSaveAndExit, initialData, isSaving }: Props) {
  const [goals, setGoals] = useState(initialData?.goals || "");
  const [competitorsInput, setCompetitorsInput] = useState((initialData?.competitors || []).join("\n"));
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    setGoals(initialData?.goals || "");
    setCompetitorsInput((initialData?.competitors || []).join("\n"));
  }, [initialData]);

  const competitorList = useMemo(() => {
    return competitorsInput
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);
  }, [competitorsInput]);

  const isValid = useMemo(() => goals.trim().length >= 2, [goals]);

  const handleSubmit = () => {
    if (!isValid) {
      return;
    }

    const invalidCompetitor = competitorList.find((url) => !isValidHttpUrl(url));
    if (invalidCompetitor) {
      setValidationError(`Invalid competitor URL: ${invalidCompetitor}`);
      return;
    }

    if (competitorList.length > 10) {
      setValidationError("You can add up to 10 competitor URLs.");
      return;
    }

    setValidationError(null);

    void onNext({
      goals: goals.trim(),
      competitors: competitorList.length ? competitorList : [],
    });
  };

  return (
    <article className="mx-auto max-w-3xl space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700 dark:text-cyan-300">Step 3 of 5</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">Strategy inputs</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Capture outcomes and competitive context so generated copy and IA can differentiate your positioning.
        </p>
      </div>

      <label htmlFor="goals" className="block text-sm font-medium text-slate-700 dark:text-slate-200">
        Primary Goals
        <textarea
          id="goals"
          rows={4}
          value={goals}
          onChange={(event) => setGoals(event.target.value)}
          placeholder="Generate qualified leads, reduce build time, and improve conversion rate on service pages."
          className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-cyan-900/50"
        />
      </label>

      <label htmlFor="competitors" className="block text-sm font-medium text-slate-700 dark:text-slate-200">
        Competitor URLs (one per line)
        <textarea
          id="competitors"
          rows={5}
          value={competitorsInput}
          onChange={(event) => setCompetitorsInput(event.target.value)}
          placeholder="https://competitor-one.com\nhttps://competitor-two.com"
          className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-cyan-900/50"
        />
      </label>

      {validationError && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-300">
          {validationError}
        </p>
      )}

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

function isValidHttpUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}