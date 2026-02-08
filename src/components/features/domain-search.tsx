'use client'

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { checkDomainAvailabilityAction } from '@/app/actions/domain-actions';
import { Loader2, CheckCircle, XCircle, Search, Globe, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';

export function DomainSearchInput() {
    const [query, setQuery] = useState('');
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async () => {
        if (!query.includes('.')) {
            setError("Invalid format. MARZ requires a TLD (e.g., .com, .nz)");
            return;
        }

        setLoading(true);
        setResult(null);
        setError(null);

        try {
            // Simulate MARZ Thinking Delay for high-end feel
            await new Promise(r => setTimeout(r, 1200));

            const data = await checkDomainAvailabilityAction(query);

            if (data.error) {
                setError(data.error);
            } else {
                setResult(data);
            }
        } catch (err) {
            setError("Critical handshake error. System re-routing...");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* 1. THE SEARCH BAR (Glassmorphism 2.0) */}
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-cyan-500/20 rounded-[22px] blur-xl opacity-0 group-focus-within:opacity-100 transition duration-1000"></div>
                <div className="relative flex items-center bg-slate-950/80 backdrop-blur-2xl rounded-2xl border border-white/10 p-2 shadow-2xl transition-all group-focus-within:border-cyan-500/30">
                    <Globe className={`w-5 h-5 ml-4 transition-colors ${loading ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`} />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value.toLowerCase());
                            if (error) setError(null);
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Search your future identity (e.g. vision-ai.com)..."
                        className="w-full h-12 bg-transparent border-none outline-none pl-4 text-white placeholder:text-slate-700 font-bold"
                    />
                    <Button
                        onClick={handleSearch}
                        disabled={loading}
                        className={`h-12 px-8 rounded-xl transition-premium flex items-center gap-2 ${loading
                            ? 'bg-slate-900 text-slate-500'
                            : 'bg-white text-black hover:bg-slate-200 hover:scale-[1.02] shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                            }`}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-[10px] font-black tracking-widest uppercase">Analyzing</span>
                            </>
                        ) : (
                            <>
                                <Search className="w-4 h-4" />
                                <span className="text-[10px] font-black tracking-widest uppercase">Verify</span>
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* 2. ERROR STATE */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-3 px-4 text-xs font-bold text-red-400/80 flex items-center gap-2 uppercase tracking-tighter"
                    >
                        <XCircle className="w-3.5 h-3.5" />
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 3. THE RESULTS PANEL (Neural Reveal) */}
            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: -10 }}
                        className="mt-6"
                    >
                        <div className="glass-luminous rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between border border-white/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-[40px] rounded-full pointer-events-none group-hover:bg-cyan-500/10 transition-colors" />

                            <div className="flex items-center gap-6">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${result.status === 'free'
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                                    : 'bg-red-500/10 border-red-500/30 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.1)]'
                                    }`}>
                                    {result.status === 'free' ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-xl font-display font-black text-white tracking-tight">{result.domain}</h3>
                                        {result.isPremium && (
                                            <span className="px-2 py-0.5 rounded-md bg-yellow-500/20 text-yellow-400 text-[8px] font-black uppercase tracking-widest border border-yellow-500/30">Premium</span>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                                        {result.status === 'free' ? (
                                            <>
                                                <Sparkles className="w-3 h-3 text-cyan-500" />
                                                Validated for Digital Architecture
                                            </>
                                        ) : (
                                            'Synchronized node unavailable'
                                        )}
                                    </p>
                                </div>
                            </div>

                            {result.status === 'free' && result.price && (
                                <div className="flex items-center gap-8 mt-6 md:mt-0 pt-6 md:pt-0 border-t md:border-t-0 border-white/5 w-full md:w-auto justify-between md:justify-end">
                                    <div className="text-right">
                                        <div className="text-3xl font-display font-black text-white tracking-tighter">
                                            ${result.price.amount}
                                        </div>
                                        <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">
                                            {result.price.currency} / ANNUAL Uplink
                                        </div>
                                    </div>
                                    <Button className="h-14 px-10 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:scale-105 transition-premium shadow-[0_10px_30px_rgba(37,99,235,0.3)] group-hover:shadow-[0_10px_40px_rgba(37,99,235,0.5)] active:scale-95">
                                        Secure Entry
                                    </Button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 4. TRUST BADGES (Neural Sync) */}
            {!result && !loading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    className="mt-8 flex flex-wrap justify-center gap-8 text-[9px] text-slate-500 font-black uppercase tracking-[0.2em]"
                >
                    <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-slate-700" /> ICANN Accredited Node</span>
                    <span className="flex items-center gap-2"><Globe className="w-4 h-4 text-slate-700" /> Instant DNS Propagation</span>
                    <span className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-slate-700" /> Enterprise SSL Provisioned</span>
                </motion.div>
            )}
        </div>
    );
}
