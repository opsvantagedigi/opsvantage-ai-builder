'use client'

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { DomainSearchInput } from '../../../components/features/domain-search';
import { Globe, Sparkles, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DomainsPage() {
    return (
        <div className="mesh-gradient min-h-screen flex flex-col selection:bg-cyan-500/30 overflow-hidden">
            <Header />

            <main className="grow pt-48 pb-24 px-6 relative z-10">
                <div className="max-w-7xl mx-auto space-y-24">

                    {/* Header Section */}
                    <header className="max-w-4xl">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <h1 className="text-6xl md:text-[8rem] font-display font-black text-white mb-8 tracking-tighter leading-none">
                                Domain <span className="text-gradient-cyan">Intelligence.</span>
                            </h1>
                            <p className="text-xl md:text-2xl text-slate-400 font-medium leading-relaxed max-w-2xl italic">
                                Reserve your corner of the digital universe. Real-time availability, wholesale whitelabel pricing, and instant provisioning.
                            </p>
                        </motion.div>
                    </header>

                    {/* Integrated Search Console */}
                    <motion.section
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="relative"
                    >
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[300px] bg-cyan-600/5 blur-[120px] rounded-full pointer-events-none" />
                        <DomainSearchInput />
                    </motion.section>

                    {/* Features Grid */}
                    <motion.section
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-12 border-t border-white/5"
                    >
                        <FeatureItem
                            icon={<Globe className="w-5 h-5 text-blue-400" />}
                            title="Global TLD Grid"
                            desc="Access to 1000+ extensions from .com to niche territorial suffixes."
                        />
                        <FeatureItem
                            icon={<Sparkles className="w-5 h-5 text-cyan-400" />}
                            title="Instant Uplink"
                            desc="MARZ propagates your DNS architecture across the global edge in seconds."
                        />
                        <FeatureItem
                            icon={<ShieldCheck className="w-5 h-5 text-emerald-400" />}
                            title="Privacy Cloak"
                            desc="WHOIS protection and domain guard standard on all ecosystem nodes."
                        />
                    </motion.section>
                </div>
            </main>

            {/* Decorative Neural Background */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
                <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[140px] rounded-full" />
                <div className="absolute bottom-[20%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[140px] rounded-full" />
            </div>

            <Footer />
        </div>
    );
}

function FeatureItem({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                {icon}
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-widest">{title}</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed uppercase tracking-tighter italic">
                {desc}
            </p>
        </div>
    );
}
