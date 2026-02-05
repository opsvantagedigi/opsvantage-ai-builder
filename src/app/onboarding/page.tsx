"use client"

import { useState } from "react"

export default function OnboardingPage() {
  const [businessName, setBusinessName] = useState("")
  const [industry, setIndustry] = useState("")
  const [goal, setGoal] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessName, industry, goal })
    })

    if (res.ok) {
      alert("Onboarding data saved. AI task will be wired next.")
    } else {
      alert("Something went wrong.")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-full max-w-lg"
      >
        <h1 className="text-2xl font-semibold mb-4">
          Tell us about your business
        </h1>

        <label className="block mb-3">
          <span className="block text-sm font-medium mb-1">Business Name</span>
          <input
            className="w-full border p-2 rounded"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
          />
        </label>

        <label className="block mb-3">
          <span className="block text-sm font-medium mb-1">Industry</span>
          <input
            className="w-full border p-2 rounded"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
          />
        </label>

        <label className="block mb-4">
          <span className="block text-sm font-medium mb-1">
            Main Goal (e.g. leads, bookings, authority)
          </span>
          <input
            className="w-full border p-2 rounded"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          />
        </label>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          Continue
        </button>
      </form>
    </div>
  )
}