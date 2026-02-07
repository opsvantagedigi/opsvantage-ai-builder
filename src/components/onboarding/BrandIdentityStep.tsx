import React, { useState } from 'react';
import { OnboardingData } from '@/types/onboarding';
import { Sparkles, Users, Target, ChevronRight, ChevronLeft } from 'lucide-react';

type Props = {
  onNext: (data: Partial<OnboardingData>) => Promise<void> | void;
  onBack?: () => void;
  onSaveAndExit?: () => void;
  initialData?: Partial<OnboardingData>;
  isSaving?: boolean;
};

export default function BrandIdentityStep({ onNext, onBack, initialData, isSaving }: Props) {
  const [brandVoice, setBrandVoice] = useState(initialData?.brandVoice || '');
  const [targetAudience, setTargetAudience] = useState(initialData?.targetAudience || '');
  const [goals, setGoals] = useState(initialData?.goals || '');

  const handleNext = () => {
    onNext({ brandVoice, targetAudience, goals });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="glass p-8 md:p-12 rounded-[32px] border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/10 blur-[60px] rounded-full pointer-events-none" />

        <div className="relative z-10">
          <h2 className="text-3xl font-bold font-display text-white mb-2">Define your identity</h2>
          <p className="text-slate-400 mb-10">Help us understand the personality and audience of your brand.</p>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300 flex items-center">
                <Sparkles className="w-4 h-4 mr-2 text-purple-400" />
                Brand Voice
              </label>
              <select
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none"
                value={brandVoice}
                onChange={(e) => setBrandVoice(e.target.value)}
              >
                <option value="">Select voice...</option>
                <option value="professional">Professional & Authoritative</option>
                <option value="friendly">Friendly & Approachable</option>
                <option value="energetic">Energetic & Bold</option>
                <option value="minimalist">Minimalist & Elegant</option>
                <option value="innovative">Innovative & Futuristic</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300 flex items-center">
                <Users className="w-4 h-4 mr-2 text-blue-400" />
                Target Audience
              </label>
              <input
                type="text"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                placeholder="e.g. Small business owners, tech enthusiasts"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300 flex items-center">
                <Target className="w-4 h-4 mr-2 text-rose-400" />
                Primary Goals
              </label>
              <textarea
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
                placeholder="What is the #1 thing you want visitors to do?"
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-10 flex justify-between items-center">
            <button
              onClick={onBack}
              className="flex items-center text-slate-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="mr-1 w-5 h-5" />
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={isSaving || !brandVoice}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center hover:bg-blue-500 transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            >
              {isSaving ? 'Saving...' : 'Continue'}
              <ChevronRight className="ml-2 w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
