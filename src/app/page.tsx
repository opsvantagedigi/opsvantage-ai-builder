import { Header } from '../../Header';
import { Footer } from '../../Footer';
import { CheckCircle2 } from 'lucide-react';
'use client';

import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Footer';
import { CheckCircle2, Search } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

function MiniDomainSearch() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query) router.push(`/services/domains?query=${encodeURIComponent(query)}`);
  };
}

const features = [
  'AI-Powered Content Generation',
  'Drag-and-Drop Visual Editor',
  'Automated SEO Optimization',
  'Custom Domains & SSL',
  'Blazing-Fast Hosting',
  'Agency & Client Management',
];

export default function LandingPage() {
  return (
    <div className="bg-slate-950 text-white min-h-screen flex flex-col">
    <div className="bg-slate-950 text-white min-h-screen flex flex-col overflow-x-hidden">
      <Header />

      <main className="grow">
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-48 pb-32 text-center">
          <div className="absolute inset-0 bg-grid-slate-800/40 mask-[linear-gradient(to_bottom,white_20%,transparent_100%)]"></div>
          <div className="relative max-w-4xl mx-auto px-4">
            <h1 className="text-5xl md:text-7xl font-bold bg-linear-to-b from-white to-slate-400 bg-clip-text text-transparent mb-6">
              Build Your Website with the Power of AI
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10">
              Go from a simple idea to a fully functional, SEO-optimized website in minutes. Let our AI do the heavy lifting, so you can focus on your business.
            </p>
            <Link
              href="/onboarding"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-500 transition-transform hover:scale-105"
            >
              Generate Your Website for Free
            </Link>
          </div>
        </section>

        {/* Mini Domain Search Section */}
        <section className="pb-20 -mt-16 relative z-10">
          <div className="max-w-2xl mx-auto px-4">
            <div className="p-6 bg-slate-900/60 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-lg">
              <h3 className="text-xl font-semibold text-center mb-4">Claim Your Digital Identity</h3>
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="your-idea.com"
                    className="w-full h-12 pl-10 pr-3 bg-slate-800 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button type="submit" className="h-12 px-6 bg-slate-600 text-white font-semibold rounded-md hover:bg-slate-500 transition-colors">Find Domain</button>
              </form>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Everything You Need to Succeed Online</h2>
              <p className="text-slate-400 text-lg">
                From initial design to going live, our platform provides a complete solution.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature) => (
                <div key={feature} className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
                  <div className="flex items-start">
                    <CheckCircle2 className="w-6 h-6 text-green-400 mr-4 mt-1 shrink-0" />
                    <h3 className="text-lg font-semibold text-white">{feature}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">Ready to Launch Your Dream Website?</h2>
            <p className="text-slate-400 text-lg mb-8">
              No credit card required. Start building for free and experience the future of web design.
            </p>
            <Link
              href="/onboarding"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-500 transition-transform hover:scale-105"
            >
              Start Building Now
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}