'use client'

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DomainSearchInput } from '@/components/features/domain-search';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, Check, 
  Zap, Cpu, Loader2 
} from 'lucide-react';
import { clsx } from 'clsx';
import { createProjectAction } from '@/app/actions/generate-project';

// --- TYPES (Locally scoped for speed, or import from @/lib/types/wizard) ---
import type { WizardState as ImportedWizardState } from '@/lib/types/wizard';
type WizardState = ImportedWizardState;

const INDUSTRIES = [
  "SaaS / Tech", "Real Estate", "Healthcare", "E-Commerce", 
  "Agency", "Restaurant", "Legal", "Portfolio"
];

const GOALS = [
  "Get More Leads", "Sell Products", "Book Appointments", 
  "Showcase Work", "Build Authority"
];

const VIBES = [
  { id: 'minimal', label: 'Minimalist', desc: 'Clean, whitespace, sophisticated.', color: 'bg-slate-100' },
  { id: 'futuristic', label: 'Futuristic', desc: 'Dark mode, neon, glassmorphism.', color: 'bg-slate-900 border-cyan-500' },
  { id: 'corporate', label: 'Corporate', desc: 'Trust, blue tones, structured.', color: 'bg-blue-900' },
  { id: 'playful', label: 'Playful', desc: 'Vibrant, rounded, friendly.', color: 'bg-pink-500' },
];

export default function WizardPage() {
  const [state, setState] = useState<WizardState>({
    step: 1,
    businessName: '',
    industry: '',
    goals: [],
    designVibe: 'futuristic',
    domain: { selected: '', status: 'skip' },
    contactEmail: ''
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Update State Helper
  const update = (field: keyof WizardState, value: string) => {
    setState(prev => ({ ...prev, [field]: value }));
  };

  const toggleGoal = (goal: string) => {
    setState(prev => {
      const exists = prev.goals.includes(goal);
      return {
        ...prev,
        goals: exists ? prev.goals.filter(g => g !== goal) : [...prev.goals, goal]
      };
    });
  };

  const next = () => setState(prev => ({ ...prev, step: prev.step + 1 }));
  const back = () => setState(prev => ({ ...prev, step: prev.step - 1 }));

  const handleFinish = async () => {
    setIsGenerating(true);
    
    try {
      // A. Call the Server Action
      const result = await createProjectAction(state);
      
      if (result.success) {
        // B. Redirect to builder with the new ID
        window.location.href = `/dashboard/${result.projectId}/builder`;
      }
    } catch (error) {
      console.error("Generation Failed", error);
      alert("MARZ failed to generate the project. Please try again.");
      setIsGenerating(false);
    }
  };

  // SIMULATE MARZ AI GENERATION (Step 6)
  useEffect(() => {
    if (state.step === 6) {
      const sequence = [
        "Initializing Neural Architecture...",
        `Analyzing ${state.industry} market trends...`,
        "Cross-referencing high-conversion layouts...",
        `Calibrating design vectors: ${state.designVibe.toUpperCase()}...`,
        "Drafting Sitemap & UX Flow...",
        "Generating copy utilizing Semantic SEO...",
        "OPSVANTAGE CORE: READY."
      ];

      let delay = 0;
      sequence.forEach((msg, i) => {
        delay += (Math.random() * 1000) + 800;
        setTimeout(() => {
          setLogs(prev => [...prev, msg]);
          if (i === sequence.length - 1) setIsProcessing(true); // Done
        }, delay);
      });
    }
  }, [state.step, state.industry, state.designVibe]);

  return (
    <div className="w-full max-w-4xl min-h-150 flex flex-col justify-center">
      <AnimatePresence mode="wait">
        
        {/* STEP 1: IDENTITY */}
        {state.step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8 text-center"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-mono mb-4 border border-blue-500/20">
              <Cpu className="w-3 h-3" /> MARZ_AGENT: LISTENING
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-linear-to-b from-white to-slate-400 tracking-tight">
              What are we building?
            </h1>
            <input 
              type="text" 
              value={state.businessName}
              onChange={(e) => update('businessName', e.target.value)}
              placeholder="e.g. Nexus Dynamics..." 
              className="w-full max-w-2xl text-center bg-transparent border-b-2 border-white/10 text-4xl py-4 focus:border-cyan-500 outline-none transition-colors placeholder:text-slate-700"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && state.businessName && next()}
            />
            <div className="pt-8">
              <Button onClick={next} disabled={!state.businessName} size="lg" className="rounded-full px-10 py-6 text-lg bg-white text-black hover:bg-slate-200">
                Next Step <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* STEP 2: DOMAIN INTEGRATION */}
        {state.step === 2 && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold">Secure your digital territory.</h2>
              <p className="text-slate-400">Search for a domain availability instantly.</p>
            </div>
            
            <DomainSearchInput />

            <div className="flex justify-between pt-12 max-w-2xl mx-auto w-full">
              <Button variant="ghost" onClick={back} className="text-slate-400 hover:text-white">Back</Button>
              <Button variant="outline" onClick={next} className="border-white/10 hover:bg-white/5">Skip for now</Button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: STRATEGY (Industry & Goals) */}
        {state.step === 3 && (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center">
              <h2 className="text-3xl font-bold">Define your mission parameters.</h2>
              <p className="text-slate-400">MARZ uses this to structure your sitemap and SEO.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Industry Selection */}
              <div className="space-y-4">
                <label className="text-sm font-mono text-cyan-400 uppercase tracking-widest">Target Sector</label>
                <div className="grid grid-cols-2 gap-2">
                  {INDUSTRIES.map(ind => (
                    <button
                      key={ind}
                      onClick={() => update('industry', ind)}
                      className={clsx(
                        "p-3 rounded-lg text-sm text-left border transition-all",
                        state.industry === ind 
                          ? "bg-cyan-500/20 border-cyan-500 text-cyan-100 shadow-[0_0_15px_-3px_rgba(6,182,212,0.3)]" 
                          : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                      )}
                    >
                      {ind}
                    </button>
                  ))}
                </div>
              </div>

              {/* Goals Selection */}
              <div className="space-y-4">
                <label className="text-sm font-mono text-blue-400 uppercase tracking-widest">Primary Objectives</label>
                <div className="space-y-2">
                  {GOALS.map(goal => (
                    <button
                      key={goal}
                      onClick={() => toggleGoal(goal)}
                      className={clsx(
                        "w-full p-3 rounded-lg text-sm text-left border transition-all flex justify-between items-center",
                        state.goals.includes(goal) 
                          ? "bg-blue-500/20 border-blue-500 text-blue-100" 
                          : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                      )}
                    >
                      {goal}
                      {state.goals.includes(goal) && <Check className="w-4 h-4 text-blue-400" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-8">
              <Button variant="ghost" onClick={back} className="text-slate-400">Back</Button>
              <Button 
                onClick={next} 
                disabled={!state.industry || state.goals.length === 0} 
                className="bg-white text-black hover:bg-slate-200 rounded-full px-8"
              >
                Continue
              </Button>
            </div>
          </motion.div>
        )}

        {/* STEP 4: AESTHETIC (The Vibe) */}
        {state.step === 4 && (
          <motion.div 
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center">
              <h2 className="text-3xl font-bold">Choose your visual signature.</h2>
              <p className="text-slate-400">MARZ will generate a unique design system based on this archetype.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {VIBES.map(vibe => (
                <button
                  key={vibe.id}
                  onClick={() => update('designVibe', vibe.id)}
                  className={clsx(
                    "group relative h-64 rounded-2xl border transition-all overflow-hidden flex flex-col justify-end p-6 text-left",
                    state.designVibe === vibe.id 
                      ? "border-cyan-500 ring-2 ring-cyan-500/30 scale-[1.02]" 
                      : "border-white/10 opacity-60 hover:opacity-100 hover:scale-[1.02]"
                  )}
                >
                  {/* Visual Preview Abstract */}
                  <div className={clsx("absolute inset-0 opacity-20 transition-opacity group-hover:opacity-40", vibe.color)} />
                  
                  <div className="relative z-10">
                    <h3 className="text-xl font-bold text-white">{vibe.label}</h3>
                    <p className="text-xs text-slate-300 mt-2">{vibe.desc}</p>
                  </div>
                  
                  {state.designVibe === vibe.id && (
                    <div className="absolute top-4 right-4 bg-cyan-500 text-black p-1 rounded-full">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="flex justify-between pt-8">
              <Button variant="ghost" onClick={back} className="text-slate-400">Back</Button>
              <Button onClick={next} className="bg-white text-black hover:bg-slate-200 rounded-full px-8">
                Confirm Aesthetic
              </Button>
            </div>
          </motion.div>
        )}

        {/* STEP 5: FINAL ID (Email) */}
        {state.step === 5 && (
          <motion.div 
            key="step5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8 text-center"
          >
            <h1 className="text-4xl font-bold">Where should we send the keys?</h1>
            <p className="text-slate-400">We&apos;ll create your secure OpsVantage dashboard here.</p>
            
            <input 
              type="email" 
              value={state.contactEmail}
              onChange={(e) => update('contactEmail', e.target.value)}
              placeholder="founder@company.com" 
              className="w-full max-w-xl text-center bg-transparent border-b-2 border-white/10 text-3xl py-4 focus:border-cyan-500 outline-none transition-colors"
              onKeyDown={(e) => e.key === 'Enter' && state.contactEmail && next()}
            />

            <div className="flex justify-between pt-12 max-w-2xl mx-auto w-full">
               <Button variant="ghost" onClick={back} className="text-slate-400">Back</Button>
               <Button 
                onClick={next} 
                disabled={!state.contactEmail.includes('@')} 
                size="lg" 
                className="bg-linear-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-full px-10 shadow-lg shadow-blue-500/25"
              >
                <Zap className="mr-2 w-4 h-4 fill-current" /> GENERATE WEBSITE
              </Button>
            </div>
          </motion.div>
        )}

        {/* STEP 6: MARZ SYNTHESIS (The Magic) */}
        {state.step === 6 && (
          <motion.div 
            key="step6"
            className="w-full max-w-2xl mx-auto bg-black/50 border border-white/10 rounded-xl p-8 font-mono text-sm relative overflow-hidden"
          >
            {/* Scanline Effect */}
            <div className="absolute inset-0 bg-linear-to-b from-transparent via-cyan-500/5 to-transparent animate-scan pointer-events-none" />
            
            <div className="flex items-center gap-4 mb-6 border-b border-white/10 pb-4">
               <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
               <span className="text-green-400 font-bold tracking-widest">MARZ_CORE // PROCESSING</span>
            </div>

            <div className="space-y-2 h-64 overflow-y-auto custom-scrollbar">
              {logs.map((log, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }}
                  className="text-slate-300"
                >
                  <span className="text-slate-600 mr-3">[{new Date().toLocaleTimeString()}]</span>
                  {log}
                </motion.div>
              ))}
              {!isProcessing && <motion.span animate={{ opacity: [0, 1, 0] }} className="text-cyan-500">_</motion.span>}
            </div>

            {isProcessing && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 pt-6 border-t border-white/10 text-center"
              >
                <p className="text-white mb-4 text-lg">Architecture Complete.</p>
                <Button 
                  onClick={handleFinish}
                  disabled={isGenerating}
                  className="w-full bg-white text-black hover:bg-slate-200 font-bold py-6 text-lg"
                >
                  {isGenerating ? <Loader2 className="animate-spin" /> : "VIEW YOUR WEBSITE"}
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}