'use client'

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DomainSearchInput } from '@/components/features/domain-search';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';

export default function WizardPage() {
  const [step, setStep] = useState(1);
  const [businessName, setBusinessName] = useState('');

  return (
    <div className=\"w-full max-w-4xl\">
      < AnimatePresence mode =\"wait\">

  {/* STEP 1: IDENTITY */ }
  {
    step === 1 && (
      <motion.div
        key=\"step1\"
    initial = {{ opacity: 0, x: 20 }
  }
  animate = {{ opacity: 1, x: 0 }
}
exit = {{ opacity: 0, x: -20 }}
className =\"space-y-8 text-center\"
  >
  <div className=\"flex items-center justify-center gap-2 mb-4\">
    < Sparkles className =\"w-6 h-6 text-cyan-400\" />
      < span className =\"text-xs font-bold uppercase tracking-[0.3em] text-slate-500\">Step 1 of 8</span>
            </div >
  <h1 className=\"text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400\">
              What are we building today ?
            </h1 >
  <p className=\"text-slate-400 text-lg\">
              Tell MARZ about your business, and we'll architect the perfect digital presence.
            </p >
  <input
    type=\"text\" 
placeholder =\"e.g. Acme Architecture...\" 
value = { businessName }
onChange = {(e) => setBusinessName(e.target.value)}
className =\"w-full max-w-xl mx-auto text-center bg-transparent border-b-2 border-white/10 text-3xl py-4 focus:border-cyan-500 outline-none transition-colors placeholder:text-slate-700\"
autoFocus
  />
  <div className=\"pt-8\">
    < Button
onClick = {() => setStep(2)}
size =\"lg\" 
className =\"rounded-full px-8 text-lg\"
disabled = {!businessName.trim()}
              >
  Next < ArrowRight className =\"ml-2 w-5 h-5\" />
              </Button >
            </div >
          </motion.div >
        )}

{/* STEP 2: DOMAIN (COMMERCIAL INTEGRATION) */ }
{
  step === 2 && (
    <motion.div
      key=\"step2\"
  initial = {{ opacity: 0, x: 20 }
}
animate = {{ opacity: 1, x: 0 }}
exit = {{ opacity: 0, x: -20 }}
className =\"space-y-6\"
  >
  <div className=\"text-center mb-8\">
    < div className =\"flex items-center justify-center gap-2 mb-4\">
      < Sparkles className =\"w-6 h-6 text-cyan-400\" />
        < span className =\"text-xs font-bold uppercase tracking-[0.3em] text-slate-500\">Step 2 of 8</span>
              </div >
  <h2 className=\"text-3xl md:text-4xl font-bold mb-4\">Claim your digital territory.</h2>
    < p className =\"text-slate-400 text-lg\">
                Search for a domain or skip to use a free subdomain for now.
              </p >
            </div >

  {/* THE PHASE 2 COMPONENT IN ACTION */ }
  < div className =\"max-w-3xl mx-auto\">
    < DomainSearchInput />
            </div >

  <div className=\"flex justify-between pt-12 max-w-3xl mx-auto\">
    < Button variant =\"ghost\" onClick={() => setStep(1)}>
      < ArrowLeft className =\"mr-2\" /> Back
              </Button >
  <Button variant=\"outline\" onClick={() => setStep(3)}>
                Skip for now
              </Button >
            </div >
          </motion.div >
        )}

{/* STEP 3: INDUSTRY (Coming Soon) */ }
{
  step === 3 && (
    <motion.div
      key=\"step3\"
  initial = {{ opacity: 0, x: 20 }
}
animate = {{ opacity: 1, x: 0 }}
exit = {{ opacity: 0, x: -20 }}
className =\"space-y-8 text-center\"
  >
  <div className=\"flex items-center justify-center gap-2 mb-4\">
    < Sparkles className =\"w-6 h-6 text-cyan-400\" />
      < span className =\"text-xs font-bold uppercase tracking-[0.3em] text-slate-500\">Step 3 of 8</span>
            </div >
  <h2 className=\"text-3xl md:text-4xl font-bold\">What industry are you in?</h2>
    < p className =\"text-slate-400 text-lg\">
              MARZ will tailor the design and features to your specific market.
            </p >

  <div className=\"grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto pt-8\">
{
  ['Dental', 'SaaS', 'E-Commerce', 'Consulting', 'Real Estate', 'Other'].map((industry) => (
    <button
      key={industry}
      className=\"p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-cyan-500/50 transition-all group\"
  >
  <div className=\"text-lg font-bold text-white group-hover:text-cyan-400 transition-colors\">
                    { industry }
                  </div >
                </button >
              ))
}
            </div >

  <div className=\"flex justify-between pt-12 max-w-3xl mx-auto\">
    < Button variant =\"ghost\" onClick={() => setStep(2)}>
      < ArrowLeft className =\"mr-2\" /> Back
              </Button >
            </div >
          </motion.div >
        )}

      </AnimatePresence >
    </div >
  );
}
