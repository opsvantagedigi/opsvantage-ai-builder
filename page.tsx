'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import BusinessDetailsStep from '@/components/onboarding/BusinessDetailsStep';
import BrandIdentityStep from '@/components/onboarding/BrandIdentityStep';
import StrategyStep from '@/components/onboarding/StrategyStep';
import DesignPreferencesStep from '@/components/onboarding/DesignPreferencesStep';
import SummaryStep from '@/components/onboarding/SummaryStep';

export interface OnboardingData {
  businessName?: string;
  businessType?: string;
  industry?: string;
  description?: string;
  brandVoice?: string;
  targetAudience?: string;
  goals?: string;
  competitors?: string[];
  colorPalette?: string[];
  designStyle?: string;
}

const OnboardingPage = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<OnboardingData>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, you'd fetch existing onboarding data from your API.
    const fetchInitialData = async () => {
      // const response = await fetch('/api/onboarding');
      // const data = await response.json();
      // setFormData(data.onboarding || {});
      setFormData({
        goals: 'Number one in web development and ultimate peoples choice',
        competitors: ['10web.io'],
      });
      setIsLoading(false);
    };

    fetchInitialData();
  }, []);

  const handleNext = (data: Partial<OnboardingData>) => {
    const updatedData = { ...formData, ...data };
    setFormData(updatedData);
    // TODO: Connect to PATCH /api/onboarding to save progress
    console.log('Saving step data:', data);
    setStep((prev) => prev + 1);
  };

  const handleBack = () => setStep((prev) => prev - 1);

  const handleSaveAndExit = () => {
    console.log('Saving and exiting...', formData);
    router.push('/dashboard'); // Assuming a dashboard route exists
  };

  const handleGenerateSite = async () => {
    console.log('Final data, starting site generation:', formData);
    // TODO: Final API call to trigger sitemap/page generation
  };

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading Onboarding...</div>;
  }

  const renderStep = () => {
    const props = { onSaveAndExit, initialData: formData };
    switch (step) {
      case 1: return <BusinessDetailsStep onNext={handleNext} {...props} />;
      case 2: return <BrandIdentityStep onNext={handleNext} onBack={handleBack} {...props} />;
      case 3: return <StrategyStep onNext={handleNext} onBack={handleBack} {...props} />;
      case 4: return <DesignPreferencesStep onNext={handleNext} onBack={handleBack} {...props} />;
      case 5: return <SummaryStep onBack={handleBack} onGenerate={handleGenerateSite} formData={formData} />;
      default: return <BusinessDetailsStep onNext={handleNext} {...props} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {renderStep()}
    </div>
  );
};

export default OnboardingPage;