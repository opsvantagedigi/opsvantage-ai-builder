import React, { useState } from 'react'

export default function StrategyStep({ onNext, onBack, onSaveAndExit, initialData, isSaving }: any) {
  const [goals, setGoals] = useState(initialData?.goals || '')
  const [competitorsInput, setCompetitorsInput] = useState(Array.isArray(initialData?.competitors) ? (initialData.competitors || []).join(', ') : (initialData?.competitors || ''))

  const handleNext = () => {
    const competitors = typeof competitorsInput === 'string'
      ? competitorsInput.split(',').map((s: string) => s.trim()).filter(Boolean)
      : (competitorsInput || [])
    onNext({ goals, competitors })
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Strategy</h2>
      <label className="block mb-2">What are the primary goals for your website?</label>
      <input className="input" placeholder="e.g., Generate more leads" value={goals} onChange={e => setGoals(e.target.value)} />
      <label className="block mt-4 mb-2">Competitors (comma separated)</label>
      <input className="input" placeholder="10web.io, wix.com" value={competitorsInput} onChange={e => setCompetitorsInput(e.target.value)} />
      <div className="flex justify-between mt-6">
        <button onClick={onBack} className="px-4 py-2 bg-gray-200 rounded">Back</button>
        <div className="flex gap-2">
          <button onClick={() => onSaveAndExit && onSaveAndExit()} className="px-4 py-2 bg-gray-200 rounded">Save & Exit</button>
          <button onClick={handleNext} className="px-4 py-2 bg-blue-600 text-white rounded" disabled={isSaving}>{isSaving ? 'Saving...' : 'Next'}</button>
        </div>
      </div>
    </div>
  )
}
