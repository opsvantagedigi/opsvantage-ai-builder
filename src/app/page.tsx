"use client";

import Link from 'next/link';
import { Header } from '../../Header';
import { Footer } from '../../Footer';
import {
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
  Globe,
  BarChart3,
  Clock,
  CheckCircle2,
  MousePointer2,
  ChevronRight,
  Layers,
  Cpu
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="mesh-gradient min-h-screen flex flex-col selection:bg-blue-500/30 overflow-hidden">
      <Header />

      <main className="grow">
        {/* Global Cinematic Filter */}
        <div className="fixed inset-0 pointer-events-none z-[1] opacity-40 mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

        {/* Hero Section */}
        <section className="relative pt-56 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-8 animate-float">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-blue-200">
              Powered by Next-Gen AI v2.0
            </span>
          </div>

          <h1 className="text-6xl md:text-9xl font-display font-bold text-white leading-[0.9] mb-10 tracking-tighter">
            <span className="block overflow-hidden pb-2">
              <span className="animate-text-reveal block">Launch your brand</span>
            </span>
            <span className="text-gradient-vibrant block overflow-hidden pb-4">
              <span className="animate-text-reveal block [animation-delay:0.2s]">with Digital Precision</span>
            </span>
          </h1>

          <p className="max-w-2xl text-lg md:text-2xl text-slate-400 font-medium mb-16 animate-text-reveal [animation-delay:0.4s] leading-relaxed">
            OpsVantage AI Builder automates the complexity of scaling online. From high-fidelity strategy to premium website generation, we build your future in minutes.
          </p>

          <div className="flex flex-col sm:flex-row gap-8 animate-text-reveal [animation-delay:0.6s]">
            <Link
              href="/onboarding"
              className="group relative px-12 py-6 bg-blue-600 text-white rounded-2xl font-black text-xl flex items-center justify-center gap-3 hover:bg-blue-500 transition-all hover:scale-105 hover:shadow-[0_0_50px_rgba(37,99,235,0.5)] active:scale-95"
            >
              Start Building Free
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </Link>
            <Link
              href="/onboarding"
              className="px-12 py-6 glass hover:bg-white/10 text-white rounded-2xl font-bold text-xl transition-all flex items-center justify-center border border-white/10 hover:border-white/20 active:scale-95"
            >
              Explore Services
            </Link>
          </div>

          {/* Floating AI Elements Decoration */}
          <div className="absolute top-1/2 left-0 w-80 h-80 bg-blue-500/10 blur-[140px] rounded-full animate-glow select-none pointer-events-none -translate-x-1/2" />
          <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-purple-500/10 blur-[140px] rounded-full animate-glow select-none pointer-events-none translate-x-1/2" />
        </section>

        {/* Social Proof Marquee (Partner Logos) */}
        <section className="py-24 border-y border-white/5 bg-white/[0.01] relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 mb-16 flex flex-col md:flex-row items-center justify-between gap-6">
            <h2 className="text-sm font-black uppercase tracking-[0.4em] text-slate-500 flex items-center gap-4">
              <div className="w-8 h-[1px] bg-slate-800" />
              Trusted By Global Innovators
            </h2>
            <div className="flex items-center gap-8 saturate-0 opacity-50">
              <span className="text-xl font-display font-black text-white">FORBES</span>
              <span className="text-xl font-display font-black text-white">NYT</span>
              <span className="text-xl font-display font-black text-white">WIRED</span>
            </div>
          </div>

          <div className="flex overflow-hidden relative group">
            <div className="flex animate-marquee gap-24 whitespace-nowrap py-4 items-center">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <MarqueeItem key={i} index={i} />
              ))}
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <MarqueeItem key={`dup-${i}`} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* Feature Showcase ("Opened Cards" Style) */}
        <section id="features" className="py-40 px-6 max-w-7xl mx-auto relative z-10">
          <div className="mb-24 space-y-6">
            <div className="w-12 h-1 bg-blue-600 rounded-full" />
            <h2 className="text-5xl md:text-8xl font-display font-bold text-white tracking-tighter">Designed for scale.</h2>
            <p className="text-slate-400 max-w-2xl text-xl leading-relaxed font-medium">Every component of our builder is engineered for conversion, speed, and cinematic visual impact.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <FeatureCard
              icon={<Zap className="w-7 h-7 text-yellow-400 fill-yellow-400/20" />}
              title="Instant Generation"
              desc="Our proprietary AI engine creates high-fidelity landing pages in under 60 seconds."
              details={["Dynamic Component Injection", "Automated Image Enhancement", "Semantic HTML Structure"]}
              tag="SPEED"
            />
            <FeatureCard
              icon={<Shield className="w-7 h-7 text-emerald-400 fill-emerald-400/20" />}
              title="Ironclad Security"
              desc="Enterprise-grade protection standard on every project we build."
              details={["Built-in DDoS Shielding", "Automated Edge SSL", "Zero Trust Governance"]}
              tag="TRUST"
            />
            <FeatureCard
              icon={<Cpu className="w-7 h-7 text-blue-400 fill-blue-400/20" />}
              title="Neural Analytics"
              desc="Understand your users with ML-powered behavior analysis and forecasting."
              details={["Session Replay Engines", "Growth Prediction Models", "Real-time Edge Metrics"]}
              tag="INSIGHT"
            />
          </div>
        </section>

        {/* Social Proof Stats */}
        <section className="py-24 bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            <StatItem value="12M+" label="SITES GENERATED" />
            <StatItem value="99.9%" label="SYSTEM UPTIME" />
            <StatItem value="250k+" label="HAPPY AGENCIES" />
            <StatItem value="2min" label="AVG. DEPLOY TIME" />
          </div>
        </section>

        {/* Testimonial Section */}
        <section className="py-40 px-6">
          <div className="max-w-5xl mx-auto glass-heavy p-16 md:p-24 rounded-[48px] text-center relative overflow-hidden group border border-white/10">
            <div className="absolute top-0 left-0 w-full h-full bg-blue-600/5 group-hover:bg-blue-600/10 transition-premium" />
            <div className="absolute top-10 left-10 text-9xl text-white/5 font-display select-none">"</div>
            <div className="relative z-10">
              <h3 className="text-4xl md:text-6xl font-display font-bold text-white mb-10 tracking-tight italic leading-tight">
                "We scaled from zero to 10k users in 30 days using OpsVantage's AI-generated strategy. The precision is unmatched."
              </h3>
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 p-[2px] mb-6 shadow-2xl rotate-3">
                  <div className="w-full h-full rounded-2xl bg-slate-900 flex items-center justify-center overflow-hidden">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Testimonial" className="w-full h-full" />
                  </div>
                </div>
                <p className="text-white font-black text-xl">Arto Minasyan</p>
                <p className="text-blue-400 text-xs font-black uppercase tracking-[0.3em] mt-1">Founder, Stealth Studio</p>
              </div>
            </div>
          </div>
        </section>

        {/* Final Call to Action */}
        <section className="py-60 px-6 text-center relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[160px] rounded-full pointer-events-none animate-glow" />

          <div className="relative z-10 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-10 border border-blue-500/20">
              <Zap className="w-4 h-4 text-blue-400" />
              <span className="text-[10px] uppercase tracking-[0.3em] font-black text-blue-400">Join the waitlist for v3.0</span>
            </div>

            <h2 className="text-6xl md:text-9xl font-display font-bold text-white mb-16 tracking-tighter leading-none">
              Ready to transcend the <span className="text-gradient">ordinary?</span>
            </h2>

            <div className="flex flex-col sm:flex-row gap-8 justify-center items-center scale-110">
              <Link
                href="/onboarding"
                className="group px-16 py-8 bg-white text-black rounded-[2rem] font-black text-2xl flex items-center gap-3 hover:bg-slate-200 transition-premium hover:scale-105 shadow-2xl"
              >
                Claim Your Future <ChevronRight className="w-7 h-7 group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>

            <div className="mt-16 flex flex-wrap justify-center gap-8 text-slate-500 font-bold uppercase tracking-widest text-[10px]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-blue-500" /> Instant Access
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-blue-500" /> Zero Credit Card
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-blue-500" /> Enterprise Support
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function MarqueeItem({ index }: { index: number }) {
  return (
    <div className="flex items-center gap-6 text-slate-400 group cursor-pointer hover:text-white transition-premium">
      <div className="w-14 h-14 glass rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:scale-110 group-hover:rotate-6 transition-premium border border-white/5 group-hover:border-blue-400/50 shadow-xl overflow-hidden">
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/5 to-white/0 group-hover:from-blue-400/20 group-hover:to-blue-600/40">
          <Layers className="w-7 h-7 group-hover:text-white transition-colors" />
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-3xl font-display font-black tracking-tighter opacity-40 group-hover:opacity-100 group-hover:translate-x-2 transition-premium">
          PROJECT_{index.toString().padStart(2, '0')}
        </span>
        <span className="text-[9px] uppercase tracking-[0.3em] font-black group-hover:text-blue-400 transition-colors">AI-Generated Build</span>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc, details, tag }: { icon: React.ReactNode, title: string, desc: string, details: string[], tag: string }) {
  return (
    <div className="glass p-10 rounded-[40px] group hover:bg-white/5 transition-all duration-700 hover:-translate-y-4 border border-white/5 hover:border-blue-500/30 shadow-2xl relative overflow-hidden">
      <div className="absolute top-4 right-8 text-[10px] font-black tracking-[0.4em] text-white/10 group-hover:text-blue-500/30 transition-colors select-none italic pt-4">
        {tag}
      </div>

      <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-10 group-hover:bg-blue-600 group-hover:rotate-6 transition-all duration-500 shadow-xl border border-white/10 group-hover:border-blue-400">
        {icon}
      </div>

      <h3 className="text-3xl font-display font-bold text-white mb-6 tracking-tight">{title}</h3>
      <p className="text-slate-400 mb-10 text-lg font-medium leading-relaxed group-hover:text-slate-200 transition-colors">{desc}</p>

      <div className="space-y-4 opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-8 group-hover:translate-y-0 pb-6 border-b border-white/5">
        {details.map((item, idx) => (
          <div key={idx} className="flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(37,99,235,1)]" />
            <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest">{item}</span>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <span className="text-xs font-black text-blue-400 uppercase tracking-[0.2em] group-hover:translate-x-2 transition-transform cursor-pointer">Explore Neural Link</span>
        <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-premium">
          <ArrowRight className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

function StatItem({ value, label }: { value: string, label: string }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-4xl md:text-6xl font-display font-black text-white tracking-tighter">{value}</span>
      <span className="text-[10px] uppercase tracking-[0.4em] text-slate-500 font-black">{label}</span>
    </div>
  );
}