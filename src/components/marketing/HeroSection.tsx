'use client'

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, Command, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { DomainSearchInput } from '../features/domain-search';

export function HeroSection() {
    const [inputValue, setInputValue] = useState('');
    const [activeMode, setActiveMode] = useState<'ai' | 'domain'>('ai');

    return (
        <section className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-20 px-4 overflow-hidden">

            {/* 1. The "Status" Badge */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-12 shadow-[0_0_20px_rgba(6,182,212,0.1)] group hover:border-cyan-500/30 transition-colors"
            >
                <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,1)]"></span>
                </span>
                <span className="text-[10px] font-black text-slate-300 tracking-[0.3em] uppercase">
                    System Operational • MARZ Agent Online
                </span>
            </motion.div>

            {/* 2. The Main Headline */}
            <motion.h1
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="text-6xl md:text-[9rem] font-display font-black text-center tracking-tighter leading-[0.85] mb-8 max-w-6xl text-gradient-marz"
            >
                Autonomous Web <br />
                <span className="text-gradient-cyan italic">
                    Architecture.
                </span>
            </motion.h1>

            {/* 3. The Subheadline */}
            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="text-xl md:text-3xl text-slate-400 text-center max-w-2xl mb-16 font-medium leading-tight tracking-tight italic"
            >
                Architecting the digital future with MARZ. <br className="hidden md:block" />
                Self-healing, enterprise-grade, and infinitely scalable.
            </motion.p>

            {/* 4. The Interactive "Action" Console */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="w-full max-w-4xl relative z-20 group"
            >
                {/* Mode Toggles */}
                <div className="flex gap-4 mb-4 ml-6">
                    <button
                        onClick={() => setActiveMode('ai')}
                        className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all px-4 py-2 rounded-lg border ${activeMode === 'ai'
                                ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400'
                                : 'border-white/5 text-slate-500 hover:text-slate-300'
                            }`}
                    >
                        AI_PROMPT
                    </button>
                    <button
                        onClick={() => setActiveMode('domain')}
                        className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all px-4 py-2 rounded-lg border ${activeMode === 'domain'
                                ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400'
                                : 'border-white/5 text-slate-500 hover:text-slate-300'
                            }`}
                    >
                        DOMAIN_INTEL
                    </button>
                </div>

                <div className="p-1.5 rounded-[32px] bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)]">
                    <div className="overflow-hidden">
                        <AnimatePresence mode="wait">
                            {activeMode === 'ai' ? (
                                <motion.div
                                    key="ai-mode"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex flex-col md:flex-row gap-3 bg-slate-950/80 rounded-[26px] p-3 border border-white/5"
                                >
                                    <div className="flex-1 relative group bg-white/[0.02] rounded-2xl border border-white/5 focus-within:border-cyan-500/30 transition-all">
                                        <Command className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-600 group-focus-within:text-cyan-400 transition-colors" />
                                        <input
                                            type="text"
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            placeholder="Ask MARZ: 'Build a SaaS site for a dental clinic...'"
                                            className="w-full h-16 bg-transparent border-none outline-none pl-16 pr-6 text-lg font-bold text-white placeholder:text-slate-700"
                                        />
                                    </div>
                                    <Link
                                        href="/onboarding/wizard"
                                        className="h-16 px-12 bg-white text-black font-black text-sm uppercase tracking-[0.2em] rounded-2xl transition-all hover:scale-[1.02] flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(255,255,255,0.2)] active:scale-95 group"
                                    >
                                        <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                        Initiate Sequence
                                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="domain-mode"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    transition={{ duration: 0.3 }}
                                    className="bg-slate-950/50 rounded-[26px] p-4"
                                >
                                    <DomainSearchInput />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Domain Search Integration Hook */}
                    <div className="mt-4 px-8 pb-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">OpenProvider API: Handshake Sync</span>
                        </div>
                        <div className="flex gap-6 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                            <Link href="/services/domains" className="hover:text-cyan-400 cursor-pointer transition-colors">DOMAINS</Link>
                            <Link href="/services/ssl-security" className="hover:text-cyan-400 cursor-pointer transition-colors">SSL</Link>
                            <Link href="/services/cloud-hosting" className="hover:text-cyan-400 cursor-pointer transition-colors">HOSTING</Link>
                            <Link href="/services/professional-email" className="hover:text-cyan-400 cursor-pointer transition-colors">SECURE_EMAIL</Link>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* 5. Ambient Decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] z-0 opacity-20 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1)_0%,transparent_70%)]" />
                <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs>
                        <pattern id="neural-sync" width="8" height="8" patternUnits="userSpaceOnUse">
                            <circle cx="0.5" cy="0.5" r="0.1" fill="#06b6d4" />
                        </pattern>
                    </defs>
                    <rect width="100" height="100" fill="url(#neural-sync)" />
                </svg>
            </div>

        </section>
    );
}
