"use client";
import React, { useState, useEffect } from 'react';
import { Terminal, Cpu, Globe, Shield, Activity, Timer } from "lucide-react";

export default function ComingSoon() {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(d => d.length > 2 ? "" : d + ".");
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center text-slate-200 p-6 font-sans selection:bg-blue-500/30 overflow-hidden">
      {/* Background Grid Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20"></div>

      <div className="relative max-w-3xl w-full space-y-10 text-center z-10">
        <div className="relative inline-block group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
          <div className="relative bg-slate-900/80 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl">
            <Cpu className="w-12 h-12 text-blue-400 mx-auto" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-6xl font-black tracking-tighter text-white uppercase italic">
            MARZ <span className="text-blue-500">Initializing</span>{dots}
          </h1>
          <p className="text-slate-400 text-lg font-light tracking-wide max-w-lg mx-auto">
            OpsVantage Digital is migrating to autonomous AI governance.
          </p>
        </div>

        {/* Dynamic Event Timeline */}
        <div className="grid md:grid-cols-2 gap-4 text-left">
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-5 space-y-4 shadow-xl">
             <div className="flex items-center gap-2 text-blue-400 font-bold text-xs tracking-widest uppercase border-b border-white/5 pb-2">
                <Timer className="w-4 h-4" /> System Timeline
             </div>
             <div className="space-y-3 font-mono text-[11px]">
                <div className="flex justify-between items-center opacity-50">
                   <span>CORE_KERNEL_LOAD</span> <span className="text-green-500">COMPLETE</span>
                </div>
                <div className="flex justify-between items-center opacity-70">
                   <span>DOMAIN_MAPPING_SSL</span> <span className="text-green-500">STABLE</span>
                </div>
                <div className="flex justify-between items-center text-blue-400">
                   <span className="animate-pulse">NEURAL_BRIDGE_SYNC</span> <span className="animate-pulse">89%</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                   <span>MARKET_DEPLOYMENT</span> <span>WAITING...</span>
                </div>
             </div>
          </div>

          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-5 space-y-4 shadow-xl">
             <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs tracking-widest uppercase border-b border-white/5 pb-2">
                <Activity className="w-4 h-4" /> Live Neural Feed
             </div>
             <div className="font-mono text-[10px] space-y-2 text-slate-300">
                <p className="">{'>'} MARZ: Syncing global build hash...</p>
                <p className="">{'>'} Handshaking with Google Edge...</p>
                <p className="text-cyan-400 animate-pulse">{'>'} "I am currently constructing the Hero Gateway. Please remain logged in."</p>
             </div>
          </div>
        </div>

        <div className="flex justify-center items-center gap-6 pt-8 text-slate-500 text-[10px] uppercase tracking-[0.4em] font-bold">
            <span className="flex items-center gap-2"><Globe className="w-4 h-4" /> Global Presence Active</span>
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></div>
            <span className="flex items-center gap-2"><Shield className="w-4 h-4" /> Security Level: MAX</span>
        </div>
      </div>
    </div>
  );
}