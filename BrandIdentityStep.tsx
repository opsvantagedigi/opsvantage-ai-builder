import React, { useState } from 'react';
import ProgressBar from './ProgressBar';
import { OnboardingData } from '@/app/onboarding/page';

interface BrandIdentityStepProps {
  onNext: (data: { brandVoice: string; targetAudience: string }) => void;
  onBack: () => void;
  onSaveAndExit: () => void;
  initialData: Partial<OnboardingData>;
}

const BrandIdentityStep: React.FC<BrandIdentityStepProps> = ({ onNext, onBack, onSaveAndExit, initialData }) => {
  const [brandVoice, setBrandVoice] = useState(initialData.brandVoice || '');
  const [targetAudience, setTargetAudience] = useState(initialData.targetAudience || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({ brandVoice, targetAudience });
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-md">
      <div className="text-center mb-8">
        <ProgressBar currentStep={2} totalSteps={5} />
        <h1 className="text-3xl font-bold text-gray-800">Brand Identity</h1>
        <p className="text-gray-600 mt-2">Define how your brand communicates and who you're talking to.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label htmlFor="brandVoice" className="block text-lg font-medium text-gray-700 mb-2">
            What is your brand's voice?
          </label>
          <input
            id="brandVoice"
            type="text"
            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="e.g., Professional, Friendly, Witty, Luxurious"
            value={brandVoice}
            onChange={(e) => setBrandVoice(e.target.value)}
            required
          />
        </div>

        <div className="mb-8">
          <label htmlFor="targetAudience" className="block text-lg font-medium text-gray-700 mb-2">
            Who is your target audience?
          </label>
          <input
            id="targetAudience"
            type="text"
            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="e.g., Startups, Small business owners, Young professionals"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            required
          />
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

export default BrandIdentityStep;