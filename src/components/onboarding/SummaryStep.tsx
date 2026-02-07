import React from 'react';
import { OnboardingData } from '@/types/onboarding';
import { CheckCircle2, ChevronLeft, Rocket, FileText } from 'lucide-react';

export default function SummaryStep({ onBack, onGenerate, formData, isSaving }: {
  onBack?: () => void;
  onGenerate: () => void;
  formData?: Partial<OnboardingData>;
  isSaving?: boolean
}) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="glass p-8 md:p-12 rounded-[32px] border border-white/10 shadow-2xl relative overflow-hidden text-center">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 blur-[60px] rounded-full pointer-events-none" />

        <div className="relative z-10">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>

          <h2 className="text-3xl font-bold font-display text-white mb-2">Ready to Launch!</h2>
          <p className="text-slate-400 mb-10">Review your choices and let's build your future.</p>

          <div className="bg-white/5 rounded-2xl p-6 text-left mb-10 space-y-4 border border-white/5">
            <div className="flex items-center text-sm">
              <span className="text-slate-500 w-32">Business:</span>
              <span className="text-white font-medium">{formData?.businessName}</span>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-slate-500 w-32">Industry:</span>
              <span className="text-white font-medium">{formData?.industry}</span>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-slate-500 w-32">Voice:</span>
              <span className="text-white font-medium capitalize">{formData?.brandVoice}</span>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-slate-500 w-32">Theme:</span>
              <span className="text-white font-medium capitalize">{formData?.designStyle?.replace('-', ' ')}</span>
            </div>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row justify-between items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center text-slate-400 hover:text-white transition-colors order-2 sm:order-1"
            >
              <ChevronLeft className="mr-1 w-5 h-5" />
              Back
            </button>
            <button
              onClick={onGenerate}
              disabled={isSaving}
              className="w-full sm:w-auto px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black text-lg flex items-center justify-center hover:bg-emerald-500 transition-all hover:scale-105 shadow-[0_0_30px_rgba(16,185,129,0.3)] order-1 sm:order-2"
            >
              <Rocket className="mr-3 w-6 h-6" />
              {isSaving ? 'Initializing...' : 'Generate Website'}
            </button>
          </div>

          <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-center space-x-2 text-slate-500 text-xs font-medium">
            <FileText className="w-3 h-3" />
            <span>All data will be saved to your dashboard</span>
          </div>
        </div>
      </div>
    </div>
  );
}
