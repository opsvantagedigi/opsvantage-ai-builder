'use client';

import { Header } from '../../Header';
import { Footer } from '../../Footer';
import {
  Sparkles,
  Zap,
  ShieldCheck,
  Globe,
  Layout,
  Users,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    title: 'AI-Powered Generation',
    description: 'Transform ideas into fully functional websites in seconds with our advanced LLM engine.',
    icon: Sparkles,
    color: 'text-blue-400'
  },
  {
    title: 'Visual Edge Editor',
    description: 'A seamless drag-and-drop experience that gives you complete creative freedom.',
    icon: Layout,
    color: 'text-purple-400'
  },
  {
    title: 'Turbocharged Hosting',
    description: 'Built on world-class infrastructure for blazing-fast load times and 99.9% uptime.',
    icon: Zap,
    color: 'text-amber-400'
  },
  {
    title: 'Enterprise Security',
    description: 'Automatic SSL, DDoS protection, and daily backups to keep your data safe.',
    icon: ShieldCheck,
    color: 'text-emerald-400'
  },
  {
    title: 'Custom Domains',
    description: 'Connect any domain or register new ones directly through our streamlined gateway.',
    icon: Globe,
    color: 'text-cyan-400'
  },
  {
    title: 'Agency Suite',
    description: 'Manage unlimited clients and team members from a single unified dashboard.',
    icon: Users,
    color: 'text-rose-400'
  }
];

export default function LandingPage() {
  return (
    <div className="mesh-gradient text-white min-h-screen flex flex-col selection:bg-blue-500/30">
      <Header />

      <main className="grow">
        {/* Hero Section */}
        <section className="relative pt-40 pb-24 lg:pt-56 lg:pb-32 overflow-hidden">
          {/* Background element */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-6 text-center">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-8 animate-float">
              <Sparkles className="w-3 h-3" />
              <span>The Future of Web Building is Here</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-bold font-display tracking-tight mb-8">
              <span className="block text-gradient">Your Vision.</span>
              <span className="block text-gradient-vibrant">AI Reality.</span>
            </h1>

            <p className="text-lg md:text-2xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed">
              Skip the complexity. Launch stunning, SEO-optimized, and high-converting websites in minutes, not months.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link
                href="/onboarding"
                className="group relative px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg transition-all hover:bg-blue-500 hover:scale-105 hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] flex items-center"
              >
                <span>Launch Your Site</span>
                <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/onboarding"
                className="px-8 py-4 glass text-white rounded-2xl font-bold text-lg hover:bg-white/5 transition-all flex items-center"
              >
                View Live Demo
              </Link>
            </div>

            {/* Preview Card Mock (Design Oomph) */}
            <div className="mt-20 relative max-w-5xl mx-auto group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-1000"></div>
              <div className="relative glass rounded-3xl aspect-video overflow-hidden shadow-2xl">
                <div className="w-full h-full bg-slate-900/80 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/10">
                      <Sparkles className="w-8 h-8 text-blue-400" />
                    </div>
                    <p className="text-slate-500 text-sm font-medium tracking-wide">AI PREVIEW RENDERING...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 px-6 relative">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 space-y-4 md:space-y-0">
              <div className="max-w-xl">
                <h2 className="text-4xl md:text-5xl font-bold font-display text-white mb-6 tracking-tight">
                  Engineered for <span className="text-blue-400">Excellence</span>
                </h2>
                <p className="text-slate-400 text-lg">
                  Every tool you need to build, manage, and scale your digital empire.
                </p>
              </div>
              <Link href="/onboarding" className="text-blue-400 font-bold flex items-center hover:opacity-80 transition-opacity">
                Explore all features <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, idx) => (
                <div
                  key={feature.title}
                  className="group glass p-8 rounded-3xl transition-all duration-300 hover:bg-white/[0.05] hover:-translate-y-2 border border-white/5"
                >
                  <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 font-display">{feature.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Massive CTA Section */}
        <section className="py-32 px-6">
          <div className="max-w-5xl mx-auto relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-[40px] blur-xl opacity-20 animate-pulse"></div>
            <div className="relative glass rounded-[40px] p-12 md:p-20 text-center border border-white/10 overflow-hidden">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full" />
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full" />

              <h2 className="text-4xl md:text-6xl font-bold font-display text-white mb-8 tracking-tight">
                Ready to transcend the <br /> <span className="text-gradient-vibrant">traditional way?</span>
              </h2>
              <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-12">
                Join hundreds of agencies who have already migrated to the AI-first era of web development.
              </p>
              <Link
                href="/onboarding"
                className="inline-flex items-center px-10 py-5 bg-white text-slate-950 rounded-2xl font-black text-xl hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)]"
              >
                Get Started for Free
              </Link>
              <p className="mt-8 text-slate-500 text-sm font-medium">No credit card required • Instant setup</p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}