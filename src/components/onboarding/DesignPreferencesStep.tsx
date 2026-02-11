import { useEffect, useMemo, useState } from "react";
import { OnboardingData } from "@/types/onboarding";

type Props = {
  onNext: (data: Partial<OnboardingData>) => Promise<void> | void;
  onBack?: () => void;
  onSaveAndExit?: () => void;
  initialData?: OnboardingData;
  isSaving?: boolean;
};

const palettePresets: Record<string, string[]> = {
  "Corporate Blue": ["#0F172A", "#1D4ED8", "#38BDF8"],
  "Emerald Growth": ["#064E3B", "#10B981", "#34D399"],
  "Neutral Premium": ["#0F172A", "#475569", "#E2E8F0"],
  "Modern Contrast": ["#111827", "#2563EB", "#F59E0B"],
};

const stylePresets = ["Minimal", "Bold", "Corporate", "Editorial", "Futuristic", "Warm"];

export default function DesignPreferencesStep({ onNext, onBack, onSaveAndExit, initialData, isSaving }: Props) {
  const [selectedPalette, setSelectedPalette] = useState<string>("Corporate Blue");
  const [customPalette, setCustomPalette] = useState("");
  const [designStyle, setDesignStyle] = useState(initialData?.designStyle || "");
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    setDesignStyle(initialData?.designStyle || "");

    const existingPalette = initialData?.colorPalette || [];
    if (existingPalette.length > 0) {
      const matchingPreset = Object.entries(palettePresets).find(([, values]) => values.join(",") === existingPalette.join(","));
      if (matchingPreset) {
        setSelectedPalette(matchingPreset[0]);
        setCustomPalette("");
      } else {
        setSelectedPalette("");
        setCustomPalette(existingPalette.join(", "));
      }
    }
  }, [initialData]);

  const isValid = useMemo(() => designStyle.trim().length >= 2, [designStyle]);

  const handleSubmit = () => {
    if (!isValid) {
      return;
    }

    const parsedCustomPalette = customPalette
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    const palette = parsedCustomPalette.length > 0 ? parsedCustomPalette : selectedPalette ? palettePresets[selectedPalette] : [];

    const invalidHex = palette.find((color) => !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color));
    if (invalidHex) {
      setValidationError(`Invalid hex color: ${invalidHex}`);
      return;
    }

    if (palette.length > 8) {
      setValidationError("Please provide up to 8 brand colors.");
      return;
    }

    setValidationError(null);

    void onNext({
      colorPalette: palette,
      designStyle: designStyle.trim(),
    });
  };

  return (
    <article className="mx-auto max-w-3xl space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700 dark:text-cyan-300">Step 4 of 5</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">Design preferences</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Configure the visual direction used for generated components and copy hierarchy.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">Color Palette Presets</p>
          <div className="grid gap-2 md:grid-cols-2">
            {Object.entries(palettePresets).map(([name, colors]) => (
              <button
                key={name}
                type="button"
                onClick={() => {
                  setSelectedPalette(name);
                  setCustomPalette("");
                }}
                className={`rounded-xl border p-3 text-left transition ${
                  selectedPalette === name
                    ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20"
                    : "border-slate-300 hover:border-slate-400 dark:border-slate-700"
                }`}
              >
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{name}</p>
                <div className="mt-2 flex gap-1">
                  {colors.map((color) => (
                    <span key={color} className="h-5 w-5 rounded-full border border-slate-300 dark:border-slate-700" style={{ backgroundColor: color }} />
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>

        <label htmlFor="customPalette" className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          Custom Colors (comma separated hex)
          <input
            id="customPalette"
            value={customPalette}
            onChange={(event) => {
              setCustomPalette(event.target.value);
              if (event.target.value.trim()) {
                setSelectedPalette("");
              }
            }}
            placeholder="#0F172A, #2563EB, #22D3EE"
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-cyan-900/50"
          />
        </label>

        <label htmlFor="designStyle" className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          Design Style
          <input
            id="designStyle"
            value={designStyle}
            onChange={(event) => setDesignStyle(event.target.value)}
            list="design-style-presets"
            placeholder="Minimal and high-contrast"
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-cyan-900/50"
          />
          <datalist id="design-style-presets">
            {stylePresets.map((preset) => (
              <option key={preset} value={preset} />
            ))}
          </datalist>
        </label>
      </div>

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