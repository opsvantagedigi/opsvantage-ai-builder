'use client'

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, ChevronRight } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

interface PlaceholderPageProps {
    title: string;
    gradientTitle: string;
    description: string;
    icon?: React.ReactNode;
}

export function PlaceholderPage({ title, gradientTitle, description, icon }: PlaceholderPageProps) {
    return (
        <div className="mesh-gradient min-h-screen flex flex-col selection:bg-blue-500/30 overflow-hidden">
            <Header />

            <main className="grow pt-48 pb-24 px-6">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-12 group">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            <span className="text-sm font-black uppercase tracking-widest italic">Return to Origin</span>
                        </Link>
                    </motion.div>

                    <header className="mb-24">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                            <h1 className="text-6xl md:text-8xl font-display font-black text-white mb-8 tracking-tighter leading-none">
                                {title} <span className="text-gradient-cyan">{gradientTitle}</span>
                            </h1>
                        </motion.div>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                            className="text-xl md:text-2xl text-slate-400 font-medium leading-relaxed max-w-2xl"
                        >
                            {description}
                        </motion.p>
                    </header>

                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="p-12 glass-luminous rounded-[48px] border border-white/5 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none group-hover:bg-cyan-500/20 transition-colors" />
                        <div className="flex items-start gap-8">
                            {icon && (
                                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                                    {icon}
                                </div>
                            )}
                            <div>
                                <h3 className="text-2xl font-display font-black text-white mb-4 tracking-widest uppercase">SECTION UNDER ARCHITECTURE</h3>
                                <p className="text-slate-400 mb-8 max-w-lg font-medium leading-relaxed italic">
                                    MARZ is currently synthesizing this node of the ecosystem. Check the secure logs for real-time deployment status.
                                </p>
                                <Link href="/onboarding" className="inline-flex items-center gap-2 px-10 py-5 bg-white text-black rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-slate-200 transition-premium shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                                    Join the Beta Program <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
