'use client'

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Terminal, Shield, Zap, Sparkles, X } from 'lucide-react';

export function MarzOperator() {
    const [isOpen, setIsOpen] = useState(false);
    const [status, setStatus] = useState('INTELLIGENCE ONLINE');
    const [messages, setMessages] = useState<string[]>([
        "System Online. Ready to architect your digital presence.",
        "MARZ Protocol initialized. Monitoring system health..."
    ]);

    return (
        <div className="fixed bottom-8 right-8 z-[100]">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="mb-6 w-96 glass-luminous rounded-[32px] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center border border-blue-500/30">
                                        <Sparkles className="w-5 h-5 text-blue-400 animate-glow" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-display font-black text-white tracking-widest uppercase">MARZ OPERATOR</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{status}</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-500 hover:text-white"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-4 max-h-80 overflow-y-auto mb-6 pr-2 scrollbar-hide">
                                {messages.map((msg, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="p-4 rounded-2xl bg-white/5 border border-white/5 text-sm font-medium text-slate-300 leading-relaxed"
                                    >
                                        {msg}
                                    </motion.div>
                                ))}
                            </div>

                            <div className="relative group">
                                <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Issue command to MARZ..."
                                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-xs font-bold text-white outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-600"
                                />
                            </div>
                        </div>

                        <div className="bg-white/5 border-t border-white/5 p-4 flex items-center justify-around">
                            <div className="flex flex-col items-center gap-1 opacity-40 hover:opacity-100 transition-opacity cursor-pointer">
                                <Shield className="w-4 h-4 text-emerald-400" />
                                <span className="text-[8px] font-black text-slate-500 uppercase">Secure</span>
                            </div>
                            <div className="flex flex-col items-center gap-1 opacity-40 hover:opacity-100 transition-opacity cursor-pointer">
                                <Zap className="w-4 h-4 text-yellow-400" />
                                <span className="text-[8px] font-black text-slate-500 uppercase">Compute</span>
                            </div>
                            <div className="flex flex-col items-center gap-1 opacity-40 hover:opacity-100 transition-opacity cursor-pointer">
                                <MessageSquare className="w-4 h-4 text-blue-400" />
                                <span className="text-[8px] font-black text-slate-500 uppercase">Network</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-16 h-16 glass-luminous rounded-2xl flex items-center justify-center group shadow-2xl relative"
            >
                <div className="absolute inset-0 bg-blue-600/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <Sparkles className="w-7 h-7 text-blue-400 z-10 animate-glow" />
            </motion.button>
        </div>
    );
}
