'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingStatus } from '@prisma/client';

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
  status?: OnboardingStatus;
}

const OnboardingPage = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<OnboardingData>>({});
  const [projectId, setProjectId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      setError(null);
      setIsLoading(true);
      try {
        const response = await fetch('/api/onboarding');
        if (response.ok) {
          const data = await response.json();
          if (data.onboarding) {
            setFormData(data.onboarding);
            setProjectId(data.projectId);
          }
        } else if (response.status !== 404) {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to load your onboarding progress.');
        }
      } catch (err) {
        setError('An unexpected error occurred while loading your data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const saveData = async (data: Partial<OnboardingData>) => {
    setError(null);
    setIsSaving(true);
    try {
      // Use POST for the very first save, PATCH for all subsequent saves.
      const method = !projectId ? 'POST' : 'PATCH';
      const response = await fetch('/api/onboarding', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to save your progress.`);
      }

      if (method === 'POST') {
        const result = await response.json();
        setProjectId(result.projectId);
      }
    } catch (err: any) {
      setError(err.message);
      throw err; // Re-throw to prevent advancing to the next step
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async (data: Partial<OnboardingData>) => {
    const updatedData = { ...formData, ...data };
    setFormData(updatedData);
    try {
      await saveData(data);
      setStep((prev) => prev + 1);
    } catch (err) {
      console.error("Save failed, not moving to next step.");
    }
  };

  const handleBack = () => {
    setError(null);
    setStep((prev) => prev - 1);
  };

  const handleSaveAndExit = async () => {
    try {
      await saveData(formData);
      router.push('/dashboard');
    } catch (err) {
      // Error is already set by saveData, user can see it and decide to navigate away anyway.
      console.error("Failed to save before exiting:", err);
    }
  };

  const handleGenerateSite = async () => {
    console.log('Final data, starting site generation:', formData);
    try {
      await saveData({ ...formData, status: 'COMPLETED' });
      // Redirect to a generation status page using the project ID
      if (projectId) {
        router.push(`/generate/${projectId}`);
      } else {
        setError("Could not find a project ID to start generation.");
      }
    } catch (err) {
      console.error("Failed to finalize onboarding:", err);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading Onboarding...</div>;
  }

  const renderStep = () => {
    const props = { onSaveAndExit: handleSaveAndExit, initialData: formData, isSaving };
    switch (step) {
      case 1: return <BusinessDetailsStep onNext={handleNext} {...props} />;
      case 2: return <BrandIdentityStep onNext={handleNext} onBack={handleBack} {...props} />;
      case 3: return <StrategyStep onNext={handleNext} onBack={handleBack} {...props} />;
      case 4: return <DesignPreferencesStep onNext={handleNext} onBack={handleBack} {...props} />;
      case 5: return <SummaryStep onBack={handleBack} onGenerate={handleGenerateSite} formData={formData} isSaving={isSaving} />;
      default: return <BusinessDetailsStep onNext={handleNext} {...props} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full">
        {error && (
          <div className="max-w-2xl mx-auto p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
            <span className="font-medium">Error:</span> {error}
          </div>
        )}
        {renderStep()}
      </div>
    </div>
  );
};

export default OnboardingPage;