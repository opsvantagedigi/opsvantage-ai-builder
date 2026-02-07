import React, { useState } from 'react';
import { OnboardingData } from '@/types/onboarding';
import { Building2, Briefcase, Globe2, MessageSquareText, ChevronRight } from 'lucide-react';

type Props = {
  onNext: (data: Partial<OnboardingData>) => Promise<void> | void;
  onSaveAndExit?: () => void;
  initialData?: Partial<OnboardingData>;
  isSaving?: boolean;
};

export default function BusinessDetailsStep({ onNext, initialData, isSaving }: Props) {
  const [businessName, setBusinessName] = useState(initialData?.businessName || '');
  const [businessType, setBusinessType] = useState(initialData?.businessType || '');
  const [industry, setIndustry] = useState(initialData?.industry || '');
  const [description, setDescription] = useState(initialData?.description || '');

  const handleNext = () => {
    onNext({ businessName, businessType, industry, description });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="glass p-8 md:p-12 rounded-[32px] border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 blur-[60px] rounded-full pointer-events-none" />

        <div className="relative z-10">
          <h2 className="text-3xl font-bold font-display text-white mb-2">Tell us about your business</h2>
          <p className="text-slate-400 mb-10">We'll use these details to help our AI craft the perfect structure for your site.</p>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300 flex items-center">
                <Building2 className="w-4 h-4 mr-2 text-blue-400" />
                Business Name
              </label>
              <input
                type="text"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                placeholder="e.g. OpsVantage Digital"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300 flex items-center">
                  <Briefcase className="w-4 h-4 mr-2 text-purple-400" />
                  Business Type
                </label>
                <select
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none"
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                >
                  <option value="">Select type...</option>
                  <option value="agency">Agency</option>
                  <option value="startup">Startup</option>
                  <option value="ecommerce">E-commerce</option>
                  <option value="personal">Personal / Portfolio</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300 flex items-center">
                  <Globe2 className="w-4 h-4 mr-2 text-cyan-400" />
                  Industry
                </label>
                <input
                  type="text"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  placeholder="e.g. Technology"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300 flex items-center">
                <MessageSquareText className="w-4 h-4 mr-2 text-amber-400" />
                Short Description
              </label>
              <textarea
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
                placeholder="Describe what your business does..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-10 flex justify-end">
            <button
              onClick={handleNext}
              disabled={isSaving || !businessName}
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
