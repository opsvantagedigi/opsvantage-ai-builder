'use client'

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Shield, Lock, Zap, CheckCircle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../../../components/ui/button';

export default function SSLSecurityPage() {
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
                                Neural <span className="text-gradient-cyan">Security.</span>
                            </h1>
                            <p className="text-xl md:text-2xl text-slate-400 font-medium leading-relaxed max-w-2xl italic">
                                Encryption at the speed of thought. Automated SSL provisioning, continuous monitoring, and enterprise-grade trust signatures.
                            </p>
                        </motion.div>
                    </header>

                    {/* SSL Tier Grid */}
                    <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <SSLCertCard
                            tier="Standard"
                            price="29.99"
                            desc="Ideal for personal nodes and emergent brands."
                            features={["Domain Validation", "MARZ Auto-Install", "256-bit Encryption"]}
                        />
                        <SSLCertCard
                            tier="Business"
                            price="89.99"
                            desc="High-fidelity trust for commercial entities."
                            features={["Organization Validation", "Enhanced Trust Seal", "Priority MARZ Monitoring"]}
                            isPremium
                        />
                        <SSLCertCard
                            tier="Enterprise"
                            price="199.99"
                            desc="Quantum-ready security for global ecosystems."
                            features={["Extended Validation", "Green Bar Signature", "System-Wide Liability Guard"]}
                        />
                    </section>

                    {/* Features Grid */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 border-t border-white/5">
                        <FeatureDetail
                            icon={<Lock className="w-5 h-5 text-blue-400" />}
                            title="End-to-End Handshake"
                            desc="Every data packet within the OpsVantage ecosystem is wrapped in proprietary encryption protocols by MARZ."
                        />
                        <FeatureDetail
                            icon={<Zap className="w-5 h-5 text-yellow-400" />}
                            title="Zero-Latency Renewals"
                            desc="MARZ anticipates expiration and initiates renewal handshakes before your node ever risks downtime."
                        />
                    </section>
                </div>
            </main>

            {/* Decorative Neural Background */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
                <div className="absolute top-[20%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[140px] rounded-full" />
                <div className="absolute bottom-[20%] right-[-10%] w-[40%] h-[40%] bg-cyan-700/10 blur-[140px] rounded-full" />
            </div>

            <Footer />
        </div>
    );
}

function SSLCertCard({ tier, price, desc, features, isPremium = false }: { tier: string, price: string, desc: string, features: string[], isPremium?: boolean }) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className={`p-1 rounded-[32px] bg-gradient-to-b from-white/10 to-white/5 border border-white/10 relative overflow-hidden group ${isPremium ? 'shadow-[0_20px_40px_rgba(6,182,212,0.15)]' : ''}`}
        >
            {isPremium && (
                <div className="absolute top-4 right-6 px-3 py-1 rounded-full bg-cyan-500 text-black text-[8px] font-black uppercase tracking-widest">Recommended</div>
            )}
            <div className="bg-slate-950/80 rounded-[28px] p-8 h-full flex flex-col">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">{tier}_NODE</span>
                <div className="flex items-end gap-2 mb-6">
                    <span className="text-4xl font-display font-black text-white">${price}</span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase mb-2">/ Year</span>
                </div>
                <p className="text-xs text-slate-400 font-medium leading-relaxed italic mb-8">{desc}</p>
                <div className="space-y-3 mb-12 flex-grow">
                    {features.map((f, i) => (
                        <div key={i} className="flex items-center gap-3 text-[10px] font-black text-white/70 uppercase tracking-tighter">
                            <CheckCircle className="w-3.5 h-3.5 text-cyan-500" />
                            {f}
                        </div>
                    ))}
                </div>
                <Button className={`w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-premium ${isPremium ? 'bg-white text-black hover:bg-slate-100 shadow-[0_0_20px_rgba(255,255,255,0.1)]' : 'bg-white/5 text-white hover:bg-white/10'}`}>
                    Deploy Security
                </Button>
            </div>
        </motion.div>
    );
}

function FeatureDetail({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="flex gap-6">
            <div className="w-12 h-12 shrink-0 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                {icon}
            </div>
            <div className="space-y-2">
                <h3 className="text-sm font-black text-white uppercase tracking-widest">{title}</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed uppercase tracking-tighter italic">
                    {desc}
                </p>
            </div>
        </div>
    );
}
