"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

type IntakeFormValues = {
  brandName: string;
  targetAudience: string;
  visualStyle: "Minimal" | "Bold" | "Classic";
  requiredFeatures: string;
};

export default function ConciergeSpecIntakePage() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IntakeFormValues>({
    defaultValues: {
      brandName: "",
      targetAudience: "",
      visualStyle: "Minimal",
      requiredFeatures: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);

    const response = await fetch("/api/concierge/spec-intake", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(values),
    });

    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    if (!response.ok) {
      setSubmitError(payload?.error || "Unable to submit your consultation brief.");
      return;
    }

    router.push("/concierge/booking");
  });

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
      <section className="mx-auto max-w-2xl rounded-2xl border border-slate-800 bg-slate-900/70 p-6 md:p-8">
        <h1 className="text-2xl font-semibold text-amber-200">Consultation Spec Intake</h1>
        <p className="mt-2 text-sm text-slate-400">Tell us what you need so we can prepare your concierge consultation.</p>

        <form className="mt-6 space-y-5" onSubmit={onSubmit} noValidate>
          <div>
            <label htmlFor="brandName" className="mb-1 block text-sm text-slate-300">
              Brand Name
            </label>
            <input
              id="brandName"
              {...register("brandName", { required: "Brand Name is required", minLength: 2 })}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
            />
            {errors.brandName && <p className="mt-1 text-xs text-red-300">{errors.brandName.message}</p>}
          </div>

          <div>
            <label htmlFor="targetAudience" className="mb-1 block text-sm text-slate-300">
              Target Audience
            </label>
            <input
              id="targetAudience"
              {...register("targetAudience", { required: "Target Audience is required", minLength: 2 })}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
            />
            {errors.targetAudience && <p className="mt-1 text-xs text-red-300">{errors.targetAudience.message}</p>}
          </div>

          <div>
            <label htmlFor="visualStyle" className="mb-1 block text-sm text-slate-300">
              Visual Style
            </label>
            <select
              id="visualStyle"
              {...register("visualStyle", { required: true })}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
            >
              <option value="Minimal">Minimal</option>
              <option value="Bold">Bold</option>
              <option value="Classic">Classic</option>
            </select>
          </div>

          <div>
            <label htmlFor="requiredFeatures" className="mb-1 block text-sm text-slate-300">
              Required Features
            </label>
            <textarea
              id="requiredFeatures"
              rows={5}
              {...register("requiredFeatures", { required: "Required Features are required", minLength: 5 })}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
            />
            {errors.requiredFeatures && <p className="mt-1 text-xs text-red-300">{errors.requiredFeatures.message}</p>}
          </div>

          {submitError && <p className="text-sm text-red-300">{submitError}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Continue to Booking"}
          </button>
        </form>
      </section>
    </main>
  );
}
