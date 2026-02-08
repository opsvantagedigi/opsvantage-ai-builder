import React from 'react'
import { OnboardingData } from '@/types/onboarding'

export default function SummaryStep({ onBack, onGenerate, formData, isSaving }: { onBack?: () => void; onGenerate: () => void; formData?: OnboardingData; isSaving?: boolean }) {
  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Review & Generate</h2>
      <pre className="bg-gray-50 p-4 rounded text-sm overflow-x-auto">{JSON.stringify(formData, null, 2)}</pre>
      <div className="flex justify-between mt-6">
        <button onClick={onBack} className="px-4 py-2 bg-gray-200 rounded">Back</button>
        <button onClick={onGenerate} className="px-4 py-2 bg-green-600 text-white rounded" disabled={isSaving}>{isSaving ? 'Generating...' : 'Generate Website'}</button>
      </div>
    </div>
  )
}
