"use client"

import { useState, useEffect } from "react"
import { z } from "zod"
import {
  onboardingStep1Schema,
  onboardingStep2Schema,
  onboardingStep3Schema,
  onboardingStep4Schema,
  onboardingFullSchema,
} from "@/lib/onboarding-schema"

const steps = [
  { title: "Business Basics", description: "Tell us about your business." },
  { title: "Brand Voice & Audience", description: "Define your brand and audience." },
  { title: "Design Preferences", description: "Choose your design style." },
    { title: "Your Business Strategy", description: "Tell us your goals and list any competitors to benchmark against." },
  { title: "Review & Submit", description: "Review and finalize your onboarding." },
]

function Stepper({ step }: { step: number }) {
  return (
    <div className="flex items-center justify-center gap-4 mb-8">
      {steps.map((s, i) => (
        <div key={i} className="flex items-center group">
          <div className={`rounded-full w-10 h-10 flex items-center justify-center font-bold text-white text-lg shadow transition-all duration-300 ${
            i < step ? "bg-blue-500 scale-90" : i === step ? "bg-blue-700 scale-110 ring-4 ring-blue-200" : "bg-gray-300 scale-90"
          }`}>
            {i + 1}
          </div>
          {i < steps.length - 1 && (
            <div className="w-10 h-1 mx-2 rounded transition-all duration-300" style={{ background: i < step ? "#2563eb" : "#e5e7eb" }} />
          )}
        </div>
      ))}
    </div>
  )
}

export default function OnboardingWizard() {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [onboardingId, setOnboardingId] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState<string | null>(null)
  const [resumeAvailable, setResumeAvailable] = useState(false)
  const [initialStep, setInitialStep] = useState(0)

  // Load existing onboarding data
  useEffect(() => {
    setLoading(true)
    fetch("/api/onboarding")
      .then((res) => res.json())
      .then((data) => {
        if (data.onboarding) {
            // Normalize competitors: backend may store an array; UI expects a
            // comma-separated string for the input. Convert arrays to string
            // so the input stays editable and auto-save will convert back.
            const normalized = { ...data.onboarding }
            if (Array.isArray(normalized.competitors)) {
              normalized.competitors = normalized.competitors.join(', ')
            }
            setForm(normalized)
          setOnboardingId(data.onboarding.id)
          // Resume logic: find first incomplete step
          let resumeStep = 0
          if (data.onboarding.goals || data.onboarding.competitors) resumeStep = 4
          else if (data.onboarding.colorPalette || data.onboarding.designStyle) resumeStep = 3
          else if (data.onboarding.brandVoice || data.onboarding.targetAudience) resumeStep = 2
          else if (data.onboarding.businessType || data.onboarding.industry) resumeStep = 1
          setInitialStep(resumeStep)
          setStep(resumeStep)
          setResumeAvailable(resumeStep > 0)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  // Auto-save on form change (except review step)
  useEffect(() => {
    if (step === 4 || !onboardingId) return
    if (Object.keys(form).length === 0) return
    setLoading(true)
    // Prepare payload: ensure `competitors` is sent as an array of strings
    // as expected by the backend. If the UI stores it as a comma-separated
    // string, sanitize and split it here.
    const payload = { ...form }
    if (typeof payload.competitors === 'string') {
      payload.competitors = payload.competitors
        .split(',')
        .map((s: string) => s.trim())
        .filter((s: string) => s)
    }

    fetch("/api/onboarding", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.ok) setError(data.error || "Failed to save")
      })
      .finally(() => setLoading(false))
  }, [form, step, onboardingId])

  function handleNext() {
    setError(null)
    // Validate current step
    let schema
    if (step === 0) schema = onboardingStep1Schema
    else if (step === 1) schema = onboardingStep2Schema
    else if (step === 2) schema = onboardingStep3Schema
    else if (step === 3) schema = onboardingStep4Schema
    else schema = onboardingFullSchema
    const result = schema.safeParse(form)
    if (!result.success) {
      setError(result.error.issues[0]?.message || "Please fill all required fields.")
      return
    }
    setStep((s) => Math.min(s + 1, steps.length - 1))
  }
  function handleBack() {
    setError(null)
    setStep((s) => Math.max(s - 1, 0))
  }
  function handleChange(field: string, value: any) {
    setForm((f: any) => ({ ...f, [field]: value }))
  }
  function handleSaveExit() {
    window.location.href = "/dashboard"
  }
  function handleResume() {
    setStep(initialStep)
    setResumeAvailable(false)
  }
  // AI Suggestion handler
  async function handleSuggest(field: string) {
    setAiLoading(field)
    setError(null)
    try {
      const res = await fetch("/api/onboarding/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field, data: form }),
      })
      const data = await res.json()
      if (data.suggestion) {
        setForm((f: any) => ({ ...f, [field]: data.suggestion }))
      } else {
        setError(data.error || "AI suggestion failed")
      }
    } catch (e) {
      setError("AI suggestion failed")
    } finally {
      setAiLoading(null)
    }
  }

  async function handleFinish() {
    setError(null)
    setLoading(true)
    try {
      const payload = { ...form }
      if (typeof payload.competitors === 'string') {
        payload.competitors = payload.competitors
          .split(',')
          .map((s: string) => s.trim())
          .filter((s: string) => s)
      }
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Submission failed')
        return
      }
      // Navigate to generate page after successful submission
      window.location.href = '/generate'
    } catch (e) {
      setError('Submission failed')
    } finally {
      setLoading(false)
    }
  }

  // Step forms
  function renderStep() {
    if (loading) {
      return (
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/2" />
          <div className="h-10 bg-gray-200 rounded" />
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="h-10 bg-gray-200 rounded" />
          <div className="h-6 bg-gray-200 rounded w-1/4" />
          <div className="h-10 bg-gray-200 rounded" />
        </div>
      )
    }
    switch (step) {
      case 0:
        return (
          <div className="transition-all duration-500 animate-fade-in">
            <label className="block mb-2 font-medium">Business Name</label>
            <div className="flex gap-2 items-center">
              <input className="input" value={form.businessName || ""} onChange={e => handleChange("businessName", e.target.value)} required />
              <button type="button" className="px-2 py-1 bg-purple-100 rounded text-purple-700 flex items-center" onClick={() => handleSuggest("businessName")}>{aiLoading==="businessName" ? <span className="animate-spin w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full"></span> : "✨"}</button>
            </div>
            <label className="block mt-4 mb-2 font-medium">Business Type</label>
            <div className="flex gap-2 items-center">
              <input className="input" value={form.businessType || ""} onChange={e => handleChange("businessType", e.target.value)} required />
              <button type="button" className="px-2 py-1 bg-purple-100 rounded text-purple-700 flex items-center" onClick={() => handleSuggest("businessType")}>{aiLoading==="businessType" ? <span className="animate-spin w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full"></span> : "✨"}</button>
            </div>
            <label className="block mt-4 mb-2 font-medium">Industry</label>
            <div className="flex gap-2 items-center">
              <input className="input" value={form.industry || ""} onChange={e => handleChange("industry", e.target.value)} required />
              <button type="button" className="px-2 py-1 bg-purple-100 rounded text-purple-700 flex items-center" onClick={() => handleSuggest("industry")}>{aiLoading==="industry" ? <span className="animate-spin w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full"></span> : "✨"}</button>
            </div>
            <label className="block mt-4 mb-2 font-medium">Description</label>
            <div className="flex gap-2 items-center">
              <textarea className="input" value={form.description || ""} onChange={e => handleChange("description", e.target.value)} rows={3} />
              <button type="button" className="px-2 py-1 bg-purple-100 rounded text-purple-700 flex items-center" onClick={() => handleSuggest("description")}>{aiLoading==="description" ? <span className="animate-spin w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full"></span> : "✨"}</button>
            </div>
          </div>
        )
      case 1:
        return (
          <div className="transition-all duration-500 animate-fade-in">
            <label className="block mb-2 font-medium">Brand Voice</label>
            <div className="flex gap-2 items-center">
              <input className="input" value={form.brandVoice || ""} onChange={e => handleChange("brandVoice", e.target.value)} required />
              <button type="button" className="px-2 py-1 bg-purple-100 rounded text-purple-700 flex items-center" onClick={() => handleSuggest("brandVoice")}>{aiLoading==="brandVoice" ? <span className="animate-spin w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full"></span> : "✨"}</button>
            </div>
            <label className="block mt-4 mb-2 font-medium">Target Audience</label>
            <div className="flex gap-2 items-center">
              <input className="input" value={form.targetAudience || ""} onChange={e => handleChange("targetAudience", e.target.value)} required />
              <button type="button" className="px-2 py-1 bg-purple-100 rounded text-purple-700 flex items-center" onClick={() => handleSuggest("targetAudience")}>{aiLoading==="targetAudience" ? <span className="animate-spin w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full"></span> : "✨"}</button>
            </div>
          </div>
        )
      case 2:
        return (
          <div className="transition-all duration-500 animate-fade-in">
            <label className="block mb-2 font-medium">Color Palette (comma separated hex or preset)</label>
            <div className="flex gap-2 items-center">
              <input className="input" value={form.colorPalette || ""} onChange={e => handleChange("colorPalette", e.target.value)} required />
              <button type="button" className="px-2 py-1 bg-purple-100 rounded text-purple-700 flex items-center" onClick={() => handleSuggest("colorPalette")}>{aiLoading==="colorPalette" ? <span className="animate-spin w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full"></span> : "✨"}</button>
            </div>
            <label className="block mt-4 mb-2 font-medium">Design Style</label>
            <div className="flex gap-2 items-center">
              <input className="input" value={form.designStyle || ""} onChange={e => handleChange("designStyle", e.target.value)} required />
              <button type="button" className="px-2 py-1 bg-purple-100 rounded text-purple-700 flex items-center" onClick={() => handleSuggest("designStyle")}>{aiLoading==="designStyle" ? <span className="animate-spin w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full"></span> : "✨"}</button>
            </div>
          </div>
        )
      case 3:
        return (
          <div className="transition-all duration-500 animate-fade-in">
            <label className="block mb-2 font-medium">What are the primary goals for your website?</label>
            <div className="flex gap-2 items-center">
              <input className="input" placeholder="e.g., Generate more leads, sell products, build brand awareness" value={form.goals || ""} onChange={e => handleChange("goals", e.target.value)} required />
              <button type="button" className="px-2 py-1 bg-purple-100 rounded text-purple-700 flex items-center" onClick={() => handleSuggest("goals")}>{aiLoading==="goals" ? <span className="animate-spin w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full"></span> : "✨"}</button>
            </div>
            <label className="block mt-4 mb-2 font-medium">Who are your main competitors?</label>
            <div className="flex gap-2 items-center">
              <input className="input" placeholder="Enter competitor URLs, separated by commas" value={form.competitors || ""} onChange={e => handleChange("competitors", e.target.value)} />
              <button type="button" className="px-2 py-1 bg-purple-100 rounded text-purple-700 flex items-center" onClick={() => handleSuggest("competitors")}>{aiLoading==="competitors" ? <span className="animate-spin w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full"></span> : "✨"}</button>
            </div>
            <p className="text-sm text-gray-500 mt-2">Enter website URLs separated by commas (e.g., 10web.io, wix.com). We'll parse these into separate entries for you.</p>
          </div>
        )
      case 4:
        return (
          <div className="transition-all duration-500 animate-fade-in">
            <h3 className="font-bold mb-2">Review your information</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">{JSON.stringify(form, null, 2)}</pre>
              <button type="button" className="mt-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={handleFinish} disabled={loading}>{loading ? 'Submitting...' : 'Finish & Generate'}</button>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-xl relative">
        <Stepper step={step} />
        <h2 className="text-2xl font-bold mb-2">{steps[step].title}</h2>
        <p className="mb-6 text-gray-600">{steps[step].description}</p>
        {resumeAvailable && (
          <div className="mb-4 flex items-center gap-2">
            <button onClick={handleResume} className="px-3 py-1 bg-green-100 text-green-700 rounded">Resume where you left off</button>
          </div>
        )}
        {error && <div className="mb-4 text-red-600">{error}</div>}
        {loading && <div className="mb-4 text-blue-600">Saving...</div>}
        <form onSubmit={e => e.preventDefault()}>
          {renderStep()}
          <div className="flex justify-between mt-8">
            <button type="button" onClick={handleBack} disabled={step === 0} className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50">Back</button>
            <button type="button" onClick={handleSaveExit} className="px-4 py-2 bg-gray-100 rounded text-gray-700 ml-2">Save & Exit</button>
            {step < steps.length - 1 && (
              <button type="button" onClick={handleNext} className="px-4 py-2 bg-blue-600 text-white rounded ml-auto">Next</button>
            )}
          </div>
        </form>
      </div>
      {/* Animations */}
      <style>{`
        .animate-fade-in { animation: fadeIn 0.5s; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  )
}

// Tailwind input style
// .input { @apply w-full border border-gray-300 rounded px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-200; }