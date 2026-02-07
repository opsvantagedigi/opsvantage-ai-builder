"use client";

import Link from 'next/link';
import { ChevronDown, Sparkles, Layout, Zap, Globe, Shield, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center">
      {/* Top Bar (Promo) */}
      <div className="w-full bg-blue-600/90 backdrop-blur-md py-2 px-4 flex items-center justify-center gap-3 text-white text-[10px] md:text-xs font-bold tracking-widest uppercase selection:bg-white/20">
        <Sparkles className="w-3 h-3 text-blue-200" />
        <span className="font-display">OpsVantage AI v2.0 is now live!</span>
        <Link href="/onboarding" className="flex items-center gap-1 hover:underline group font-bold">
          Get Started <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Main Navigation */}
      <nav
        className={`w-full max-w-[1400px] mx-auto transition-all duration-500 rounded-b-2xl md:rounded-2xl mt-0 md:mt-4 ${isScrolled
            ? 'md:max-w-7xl glass-heavy shadow-2xl py-3 px-8 mx-4'
            : 'glass py-5 px-8 mx-4'
          }`}
      >
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.4)] group-hover:rotate-12 transition-all">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="text-xl font-bold font-display tracking-tight text-white">
              Ops<span className="text-blue-400">Vantage</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center space-x-8">
            {/* Products Dropdown */}
            <div className="relative group/menu">
              <button className="flex items-center gap-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors py-2">
                Products <ChevronDown className="w-4 h-4 group-hover/menu:rotate-180 transition-transform" />
              </button>
              <div className="absolute top-full -left-4 w-72 pt-4 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all duration-300 translate-y-2 group-hover/menu:translate-y-0">
                <div className="glass-heavy p-4 rounded-2xl shadow-2xl border border-white/10 flex flex-col gap-2">
                  <DropdownLink
                    icon={<Layout className="w-4 h-4" />}
                    title="Website Builder"
                    desc="AI-powered custom websites"
                    href="/onboarding"
                  />
                  <DropdownLink
                    icon={<Globe className="w-4 h-4" />}
                    title="Domain Portal"
                    desc="Search and manage domains"
                    href="/onboarding"
                  />
                  <DropdownLink
                    icon={<Shield className="w-4 h-4" />}
                    title="AI Security"
                    desc="Protected hosting & analytics"
                    href="/onboarding"
                  />
                </div>
              </div>
            </div>

            <Link href="/onboarding" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Pricing
            </Link>

            <Link href="/onboarding" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Docs
            </Link>
          </div>

          <div className="flex items-center space-x-6">
            <Link href="/login" className="hidden sm:block text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Log In
            </Link>
            <Link
              href="/onboarding"
              className="px-6 py-2.5 bg-blue-600 font-display text-white rounded-xl hover:bg-blue-500 transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] font-bold text-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}

function DropdownLink({ icon, title, desc, href }: { icon: React.ReactNode, title: string, desc: string, href: string }) {
  return (
    <Link href={href} className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group/item">
      <div className="mt-0.5 p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover/item:bg-blue-500 group-hover/item:text-white transition-all">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-bold text-white tracking-tight">{title}</span>
        <span className="text-[10px] text-slate-400 font-medium">{desc}</span>
      </div>
    </Link>
  );
}