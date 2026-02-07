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
      throw error;
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
      console.error("Failed to save before exiting:", error);
    }
  };

  const handleGenerateSite = async () => {
    try {
      await saveData({ ...formData, status: 'COMPLETED' });
      if (projectId) {
        router.push(`/generate/${projectId}`);
      } else {
        setError("Could not find a project ID to start generation.");
      }
    } catch (error) {
      console.error("Failed to finalize onboarding:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen mesh-gradient flex items-center justify-center selection:bg-blue-500/30">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-6" />
          <p className="text-slate-400 font-display font-bold animate-pulse">OPTIMIZING AI CONTEXT...</p>
        </div>
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
    <div className="min-h-screen mesh-gradient flex flex-col selection:bg-blue-500/30">
      <div className="py-12 px-4 sm:px-6 lg:px-8 grow flex items-center justify-center">
        <div className="w-full relative">
          {error && (
            <div className="max-w-2xl mx-auto glass p-4 mb-8 text-sm text-red-400 rounded-2xl border border-red-500/20 bg-red-500/5 shadow-xl" role="alert">
              <span className="font-bold uppercase tracking-widest text-[10px] bg-red-500/20 px-2 py-0.5 rounded-full mr-3">Error</span>
              {error}
            </div>
          )}

          {/* Progress Bar */}
          <div className="max-w-2xl mx-auto mb-12 flex items-center justify-between px-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm transition-all duration-500 ${step >= s ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'bg-white/5 text-slate-500 border border-white/5'}`}>
                  {s}
                </div>
                {s < 5 && <div className={`w-8 md:w-16 h-0.5 mx-2 rounded-full transition-all duration-1000 ${step > s ? 'bg-blue-600' : 'bg-white/5'}`} />}
              </div>
            ))}
          </div>

          {renderStep()}
        </div>
      </div>
      <div className="py-6 text-center text-slate-600 text-[10px] font-bold tracking-widest uppercase">
        OpsVantage AI Onboarding v2.0
      </div>
    </div>
  );
};

export default OnboardingPage;