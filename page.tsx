import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Footer';
import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

const tiers = [
  {
    name: 'Free',
    price: '$0',
    features: [
      '1 Project',
      'OpsVantage Subdomain',
      '50 AI Generations/month',
      'Community Support',
    ],
    cta: 'Get Started',
    ctaLink: '/onboarding',
    isFeatured: false,
  },
  {
    name: 'Pro',
    price: '$29',
    features: [
      '5 Projects',
      'Connect Custom Domain',
      'Unlimited AI Generations',
      'Email & Chat Support',
      'Advanced Analytics',
    ],
    cta: 'Start Your Trial',
    ctaLink: '/onboarding',
    isFeatured: true,
  },
  {
    name: 'Agency',
    price: '$99',
    features: [
      'Unlimited Projects',
      'Client Management Dashboard',
      'White-Labeling Options',
      'Priority Support',
      'Team Collaboration',
    ],
    cta: 'Contact Sales',
    ctaLink: '/contact',
    isFeatured: false,
  },
];

export default function PricingPage() {
  return (
    <div className="bg-slate-950 text-white min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        <section className="py-32">
          <div className="max-w-6xl mx-auto px-4">
            <header className="text-center mb-16">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-4">
                Find the Right Plan for You
              </h1>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                Start for free and scale as you grow. All plans include our powerful AI generation engine and enterprise-grade infrastructure.
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
              {tiers.map((tier) => (
                <div
                  key={tier.name}
                  className={`p-8 rounded-2xl border ${
                    tier.isFeatured
                      ? 'border-blue-500 scale-105 bg-slate-900'
                      : 'border-slate-800 bg-slate-900/50'
                  } flex flex-col h-full`}
                >
                  <h2 className="text-2xl font-semibold mb-2">{tier.name}</h2>
                  <p className="text-4xl font-bold mb-6">
                    {tier.price}
                    {tier.name !== 'Free' && <span className="text-base font-normal text-slate-400">/ month</span>}
                  </p>

                  <ul className="space-y-4 mb-8 flex-grow">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <span className="text-slate-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={tier.ctaLink}
                    className={`w-full text-center py-3 rounded-lg font-semibold transition-colors ${
                      tier.isFeatured
                        ? 'bg-blue-600 hover:bg-blue-500 text-white'
                        : 'bg-slate-600 hover:bg-slate-500 text-white'
                    }`}
                  >
                    {tier.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}