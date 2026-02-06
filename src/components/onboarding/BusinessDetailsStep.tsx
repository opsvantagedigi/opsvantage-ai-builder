import React, { useState } from 'react'

export default function BusinessDetailsStep({ onNext, onSaveAndExit, initialData, isSaving }: any) {
  const [businessName, setBusinessName] = useState(initialData?.businessName || '')
  const [businessType, setBusinessType] = useState(initialData?.businessType || '')
  const [industry, setIndustry] = useState(initialData?.industry || '')

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Business Details</h2>
      <label className="block mb-2">Business Name</label>
      <input className="input" value={businessName} onChange={e => setBusinessName(e.target.value)} />
      <label className="block mt-4 mb-2">Business Type</label>
      <input className="input" value={businessType} onChange={e => setBusinessType(e.target.value)} />
      <label className="block mt-4 mb-2">Industry</label>
      <input className="input" value={industry} onChange={e => setIndustry(e.target.value)} />
      <div className="flex justify-between mt-6">
        <button onClick={() => onSaveAndExit && onSaveAndExit()} className="px-4 py-2 bg-gray-200 rounded">Save & Exit</button>
        <button onClick={() => onNext({ businessName, businessType, industry })} className="px-4 py-2 bg-blue-600 text-white rounded" disabled={isSaving}>{isSaving ? 'Saving...' : 'Next'}</button>
      </div>
    </div>
  )
}
