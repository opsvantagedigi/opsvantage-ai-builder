"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

type IntakeValues = {
  companyName: string;
  communityMission: string;
};

export default function IntakeForm() {
  const [submitState, setSubmitState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<IntakeValues>({
    defaultValues: {
      companyName: "",
      communityMission: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitState("loading");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/marz/intake", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error || "Failed to submit intake.");
      }

      setSubmitState("success");
      reset();
    } catch (error) {
      setSubmitState("error");
      setErrorMessage(error instanceof Error ? error.message : "Failed to submit intake.");
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-white/90 p-5 dark:border-slate-700 dark:bg-slate-900/70">
      <div>
        <label htmlFor="companyName" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
          Company Name
        </label>
        <input
          id="companyName"
          {...register("companyName", { required: "Company Name is required", minLength: 2 })}
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
        />
        {errors.companyName && <p className="mt-1 text-xs text-red-500">{errors.companyName.message}</p>}
      </div>

      <div>
        <label htmlFor="communityMission" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
          Community Mission
        </label>
        <textarea
          id="communityMission"
          rows={4}
          {...register("communityMission", { required: "Community Mission is required", minLength: 8 })}
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
        />
        {errors.communityMission && <p className="mt-1 text-xs text-red-500">{errors.communityMission.message}</p>}
      </div>

      <button type="submit" disabled={submitState === "loading"} className="cta-zenith inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 dark:bg-amber-400 dark:text-slate-950">
        {submitState === "loading" ? "Submitting..." : "Submit Mission Intake"}
      </button>

      {submitState === "success" && <p className="text-sm text-emerald-600 dark:text-emerald-300">Mission received. We’ll contact you shortly.</p>}
      {submitState === "error" && <p className="text-sm text-red-500 dark:text-red-300">{errorMessage}</p>}
    </form>
  );
}
