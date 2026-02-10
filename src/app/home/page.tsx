import React from 'react';
import { Terminal, Cpu, Globe, Shield, Activity } from "lucide-react";

export default function ComingSoon() {
  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center text-slate-200 p-6 font-sans selection:bg-blue-500/30">
      <div className="max-w-2xl w-full space-y-12 text-center">
        
        {/* Visual Brand Header */}
        <div className="relative inline-block">
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
          <div className="relative bg-slate-900/50 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl">
            <Cpu className="w-14 h-14 text-blue-500 mx-auto" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-6xl font-extrabold tracking-tighter text-white">
            OpsVantage <span className="text-blue-500">Digital</span>
          </h1>
          <p className="text-slate-400 text-xl font-light max-w-lg mx-auto leading-relaxed">
            The future of business automation is being forged. Governed by <span className="text-blue-400 font-medium">MARZ AI</span>.
          </p>
        </div>

        {/* MARZ Operator Status Terminal */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-b from-blue-500/20 to-transparent rounded-2xl blur-sm opacity-50"></div>
          <div className="relative bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-left font-mono text-sm shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-blue-400" />
                <span className="text-xs uppercase tracking-[0.2em] text-blue-400 font-bold">MARZ_v1.0.4_Console</span>
              </div>
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
                <div className="w-2 h-2 rounded-full bg-green-500/50 animate-pulse"></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex gap-3">
                <span className="text-slate-600">08:24:11</span>
                <span className="text-green-500">[OK]</span>
                <span className="text-slate-300 text-xs">Infrastructure handshake: us-central1</span>
              </div>
              <div className="flex gap-3">
                <span className="text-slate-600">08:24:15</span>
                <span className="text-blue-400">[INFO]</span>
                <span className="text-slate-300 text-xs">Domain verified: opsvantagedigital.online</span>
              </div>
              <div className="flex gap-3">
                <span className="text-slate-600">08:25:02</span>
                <span className="text-yellow-500">[WARN]</span>
                <span className="text-slate-300 text-xs">Neural Bridge: Syncing Windows-to-Linux build...</span>
              </div>
              <div className="flex gap-3 items-center">
                <span className="text-slate-600">08:25:04</span>
                <Activity className="w-3 h-3 text-blue-500 animate-spin" />
                <span className="text-blue-400 animate-pulse text-xs italic font-bold">"Stand by. I am optimizing your environment." — MARZ</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Metrics */}
        <div className="flex flex-wrap justify-center items-center gap-8 pt-12">
            <div className="flex items-center gap-2 text-slate-500 text-[10px] uppercase tracking-widest font-bold">
                <Globe className="w-4 h-4 text-slate-600" /> Edge Network: Active
            </div>
            <div className="h-4 w-[1px] bg-white/10 hidden sm:block"></div>
            <div className="flex items-center gap-2 text-slate-500 text-[10px] uppercase tracking-widest font-bold">
                <Shield className="w-4 h-4 text-slate-600" /> Security Level: Lvl 4
            </div>
            <div className="h-4 w-[1px] bg-white/10 hidden sm:block"></div>
            <div className="text-blue-500/80 text-[10px] uppercase tracking-[0.3em] font-black">
                EST. LAUNCH 2026
            </div>
        </div>
      </div>
    </div>
  );
}