import React, { useState } from 'react'

export default function BrandIdentityStep({ onNext, onBack, onSaveAndExit, initialData, isSaving }: any) {
  const [brandVoice, setBrandVoice] = useState(initialData?.brandVoice || '')
  const [targetAudience, setTargetAudience] = useState(initialData?.targetAudience || '')

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Brand Voice & Audience</h2>
      <label className="block mb-2">Brand Voice</label>
      <input className="input" value={brandVoice} onChange={e => setBrandVoice(e.target.value)} />
      <label className="block mt-4 mb-2">Target Audience</label>
      <input className="input" value={targetAudience} onChange={e => setTargetAudience(e.target.value)} />
      <div className="flex justify-between mt-6">
        <button onClick={onBack} className="px-4 py-2 bg-gray-200 rounded">Back</button>
        <div className="flex gap-2">
          <button onClick={() => onSaveAndExit && onSaveAndExit()} className="px-4 py-2 bg-gray-200 rounded">Save & Exit</button>
          <button onClick={() => onNext({ brandVoice, targetAudience })} className="px-4 py-2 bg-blue-600 text-white rounded" disabled={isSaving}>{isSaving ? 'Saving...' : 'Next'}</button>
        </div>
      </div>
    </div>
  )
}
