'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// Use local string union for onboarding status

import BusinessDetailsStep from '../../components/onboarding/BusinessDetailsStep';
import BrandIdentityStep from '../../components/onboarding/BrandIdentityStep';
import StrategyStep from '../../components/onboarding/StrategyStep';
import DesignPreferencesStep from '../../components/onboarding/DesignPreferencesStep';
import SummaryStep from '../../components/onboarding/SummaryStep';

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
  status?: 'DRAFT' | 'COMPLETED';
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
      } catch (error) {
        console.error('Failed to fetch onboarding initial data:', error);
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
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      setError(message);
      throw error; // Re-throw to prevent advancing to the next step
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async (data: unknown) => {
    const updatedData = { ...formData, ...(data as Partial<OnboardingData>) };
    setFormData(updatedData);
    try {
      await saveData(data as Partial<OnboardingData>);
      setStep((prev) => prev + 1);
    } catch (error) {
      console.error("Save failed, not moving to next step.", error);
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
    } catch (error) {
      // Error is already set by saveData, user can see it and decide to navigate away anyway.
      console.error("Failed to save before exiting:", error);
    }
  };

  const handleGenerateSite = async () => {
    console.log('Final data, starting site generation:', formData);
    try {
      await saveData({ ...formData, status: 'COMPLETED' });
      // Redirect to the project builder for final editing and publishing.
      if (projectId) {
        router.push(`/dashboard/${projectId}/builder`);
      } else {
        setError("Could not find a project ID to start generation.");
      }
    } catch (error) {
      console.error("Failed to finalize onboarding:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Loading onboarding data...</p>
      </div>
    );
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
    <div className="w-full py-8">
      {error && (
        <div
          className="mx-auto mb-4 max-w-2xl rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-300"
          role="alert"
        >
          <span className="font-medium">Error:</span> {error}
        </div>
      )}
      {renderStep()}
    </div>
  );
};

export default OnboardingPage;
