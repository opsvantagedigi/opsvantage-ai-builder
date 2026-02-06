import React from 'react';
import ProgressBar from './ProgressBar';
import { OnboardingData } from '@/app/onboarding/page';

interface SummaryStepProps {
  onBack: () => void;
  onGenerate: () => void;
  formData: Partial<OnboardingData>;
}

const SummaryStep: React.FC<SummaryStepProps> = ({ onBack, onGenerate, formData }) => {
  const summaryItems = [
    { label: 'Business Name', value: formData.businessName },
    { label: 'Business Type', value: formData.businessType },
    { label: 'Industry', value: formData.industry },
    { label: 'Brand Voice', value: formData.brandVoice },
    { label: 'Target Audience', value: formData.targetAudience },
    { label: 'Goals', value: formData.goals },
    { label: 'Competitors', value: formData.competitors?.join(', ') },
    { label: 'Design Style', value: formData.designStyle },
    { label: 'Color Palette', value: formData.colorPalette?.join(', ') },
  ];

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-md">
      <div className="text-center mb-8">
        <ProgressBar currentStep={5} totalSteps={5} />
        <h1 className="text-3xl font-bold text-gray-800">Review & Generate</h1>
        <p className="text-gray-600 mt-2">
          Confirm your details below. Our AI will use this information to generate your website.
        </p>
      </div>

      <div className="space-y-4">
        {summaryItems.map(item => (
          item.value && (
            <div key={item.label} className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm font-medium text-gray-500">{item.label}</p>
              <p className="text-gray-800 font-semibold">{item.value}</p>
            </div>
          )
        ))}
      </div>

      <div className="flex justify-between items-center mt-10">
        <button type="button" onClick={onBack} className="px-6 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition">
          Back
        </button>
        <button type="button" onClick={onGenerate} className="px-8 py-3 text-white bg-green-600 rounded-md hover:bg-green-700 transition font-bold text-lg">
          ✨ Generate My Website
        </button>
      </div>
    </div>
  );
};

export default SummaryStep;