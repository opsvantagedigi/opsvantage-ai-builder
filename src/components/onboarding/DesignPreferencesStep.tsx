import React, { useState } from 'react';
import { OnboardingData } from '@/types/onboarding';
import { Palette, Layers, ChevronRight, ChevronLeft } from 'lucide-react';

type Props = {
  onNext: (data: Partial<OnboardingData>) => Promise<void> | void;
  onBack?: () => void;
  onSaveAndExit?: () => void;
  initialData?: Partial<OnboardingData>;
  isSaving?: boolean;
};

export default function DesignPreferencesStep({ onNext, onBack, initialData, isSaving }: Props) {
  const [colorPalette, setColorPalette] = useState(
    Array.isArray(initialData?.colorPalette) ? (initialData.colorPalette || []).join(', ') : (initialData?.colorPalette || '')
  );
  const [designStyle, setDesignStyle] = useState(initialData?.designStyle || '');

  const handleNext = () => {
    const colors = typeof colorPalette === 'string'
      ? colorPalette.split(',').map((s: string) => s.trim()).filter(Boolean)
      : (colorPalette || []);
    onNext({ colorPalette: colors as string[], designStyle });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="glass p-8 md:p-12 rounded-[32px] border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 blur-[60px] rounded-full pointer-events-none" />

        <div className="relative z-10">
          <h2 className="text-3xl font-bold font-display text-white mb-2">Visual Style</h2>
          <p className="text-slate-400 mb-10">Choose the look and feel of your future website.</p>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300 flex items-center">
                <Palette className="w-4 h-4 mr-2 text-cyan-400" />
                Color Palette
              </label>
              <input
                type="text"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                placeholder="e.g. #2563eb, #7c3aed (comma separated)"
                value={colorPalette}
                onChange={(e) => setColorPalette(e.target.value)}
              />
              <p className="text-[10px] text-slate-500 italic">Leave empty to let AI choose optimal colors for you.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300 flex items-center">
                <Layers className="w-4 h-4 mr-2 text-blue-400" />
                Overall Style
              </label>
              <select
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none"
                value={designStyle}
                onChange={(e) => setDesignStyle(e.target.value)}
              >
                <option value="">Select style...</option>
                <option value="minimalist">Minimalist & Clean</option>
                <option value="corporate">Corporate & Trusted</option>
                <option value="vibrant">Vibrant & Modern</option>
                <option value="dark-premium">Dark Premium (Glassmorphic)</option>
                <option value="playful">Playful & Creative</option>
              </select>
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
              disabled={isSaving}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center hover:bg-blue-500 transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            >
              {isSaving ? 'Saving...' : 'Review Summary'}
              <ChevronRight className="ml-2 w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
