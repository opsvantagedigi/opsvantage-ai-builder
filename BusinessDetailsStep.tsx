import React, { useState } from 'react';
import ProgressBar from './ProgressBar';
import { OnboardingData } from '@/app/onboarding/page';

interface BusinessDetailsStepProps {
  onNext: (data: { businessName: string; businessType: string; industry: string; description?: string }) => void;
  onSaveAndExit: () => void;
  initialData: Partial<OnboardingData>;
}

const BusinessDetailsStep: React.FC<BusinessDetailsStepProps> = ({ onNext, onSaveAndExit, initialData }) => {
  const [businessName, setBusinessName] = useState(initialData.businessName || '');
  const [businessType, setBusinessType] = useState(initialData.businessType || '');
  const [industry, setIndustry] = useState(initialData.industry || '');
  const [description, setDescription] = useState(initialData.description || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({ businessName, businessType, industry, description });
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-md">
      <div className="text-center mb-8">
        <ProgressBar currentStep={1} totalSteps={5} />
        <h1 className="text-3xl font-bold text-gray-800">About Your Business</h1>
        <p className="text-gray-600 mt-2">
          Let's start with the basics. This information helps us understand what you do.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label htmlFor="businessName" className="block text-lg font-medium text-gray-700 mb-2">
            What is your business name?
          </label>
          <input
            id="businessName"
            type="text"
            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="e.g., Acme Inc."
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="businessType" className="block text-lg font-medium text-gray-700 mb-2">
              Business Type
            </label>
            <input id="businessType" type="text" className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition" placeholder="e.g., SaaS, E-commerce" value={businessType} onChange={(e) => setBusinessType(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="industry" className="block text-lg font-medium text-gray-700 mb-2">
              Industry
            </label>
            <input id="industry" type="text" className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition" placeholder="e.g., Technology, Retail" value={industry} onChange={(e) => setIndustry(e.target.value)} required />
          </div>
        </div>

        <div className="mb-8">
          <label htmlFor="description" className="block text-lg font-medium text-gray-700 mb-2">
            Briefly describe your business (optional)
          </label>
          <textarea
            id="description"
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="What products or services do you offer?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="flex justify-between items-center mt-10">
          <span className="w-24"></span> {/* Spacer */}
          <button type="button" onClick={onSaveAndExit} className="px-6 py-2 text-blue-600 hover:underline">Save & Exit</button>
          <button type="submit" className="px-8 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition font-semibold">Next</button>
        </div>
      </form>
    </div>
  );
};

export default BusinessDetailsStep;