import React, { useState } from 'react';
import ProgressBar from './ProgressBar';
import { OnboardingData } from '@/app/onboarding/page';

interface DesignPreferencesStepProps {
  onNext: (data: { colorPalette: string[]; designStyle: string }) => void;
  onBack: () => void;
  onSaveAndExit: () => void;
  initialData: Partial<OnboardingData>;
}

const DesignPreferencesStep: React.FC<DesignPreferencesStepProps> = ({ onNext, onBack, onSaveAndExit, initialData }) => {
  const [colorPalette, setColorPalette] = useState(initialData.colorPalette || []);
  const [designStyle, setDesignStyle] = useState(initialData.designStyle || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({ colorPalette, designStyle });
  };

  // In a real app, this would be a more complex color picker component
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const colors = e.target.value.split(',').map(c => c.trim()).filter(c => c);
    setColorPalette(colors);
  }

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-md">
      <div className="text-center mb-8">
        <ProgressBar currentStep={4} totalSteps={5} />
        <h1 className="text-3xl font-bold text-gray-800">Design Preferences</h1>
        <p className="text-gray-600 mt-2">Help the AI understand the look and feel you're going for.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label htmlFor="colorPalette" className="block text-lg font-medium text-gray-700 mb-2">
            Color Palette (comma-separated hex codes)
          </label>
          <input
            id="colorPalette"
            type="text"
            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="e.g., #FFFFFF, #000000, #3B82F6"
            value={colorPalette.join(', ')}
            onChange={handleColorChange}
          />
        </div>

        <div className="mb-8">
          <label htmlFor="designStyle" className="block text-lg font-medium text-gray-700 mb-2">
            Desired Design Style
          </label>
          <input id="designStyle" type="text" className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition" placeholder="e.g., Minimalist, Modern, Corporate, Playful" value={designStyle} onChange={(e) => setDesignStyle(e.target.value)} required />
        </div>

        <div className="flex justify-between items-center mt-10">
          <button type="button" onClick={onBack} className="px-6 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition">Back</button>
          <button type="button" onClick={onSaveAndExit} className="px-6 py-2 text-blue-600 hover:underline">Save & Exit</button>
          <button type="submit" className="px-8 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition font-semibold">Next</button>
        </div>
      </form>
    </div>
  );
};

export default DesignPreferencesStep;