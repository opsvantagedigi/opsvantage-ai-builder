import React, { useState } from 'react'

export default function DesignPreferencesStep({ onNext, onBack, onSaveAndExit, initialData, isSaving }: any) {
  const [colorPalette, setColorPalette] = useState(Array.isArray(initialData?.colorPalette) ? (initialData.colorPalette || []).join(', ') : (initialData?.colorPalette || ''))
  const [designStyle, setDesignStyle] = useState(initialData?.designStyle || '')

  const handleNext = () => {
    const colors = typeof colorPalette === 'string' ? colorPalette.split(',').map((s: string) => s.trim()).filter(Boolean) : (colorPalette || [])
    onNext({ colorPalette: colors, designStyle })
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Design Preferences</h2>
      <label className="block mb-2">Color Palette (comma separated)</label>
      <input className="input" placeholder="#ff0000, #00ff00" value={colorPalette} onChange={e => setColorPalette(e.target.value)} />
      <label className="block mt-4 mb-2">Design Style</label>
      <input className="input" value={designStyle} onChange={e => setDesignStyle(e.target.value)} />
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
