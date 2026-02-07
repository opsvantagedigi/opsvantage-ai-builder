import { CheckCircle2 } from 'lucide-react';

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
    cta: 'Current Plan',
    isCurrent: true,
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
    cta: 'Upgrade to Pro',
    isCurrent: false,
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
    cta: 'Upgrade to Agency',
    isCurrent: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            Find the Right Plan for You
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Start for free and scale as you grow. All plans include our powerful AI generation engine and enterprise-grade infrastructure.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`p-8 rounded-2xl border ${
                tier.name === 'Pro'
                  ? 'border-blue-500'
                  : 'border-slate-800'
              } bg-slate-900/50 flex flex-col`}
            >
              <h2 className="text-2xl font-semibold mb-2">{tier.name}</h2>
              <p className="text-4xl font-bold mb-6">
                {tier.price}
                {tier.name !== 'Free' && <span className="text-base font-normal text-slate-400">/ month</span>}
              </p>

              <ul className="space-y-4 mb-8 grow">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <span className="text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                disabled={tier.isCurrent}
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                  tier.isCurrent
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : tier.name === 'Pro'
                    ? 'bg-blue-600 hover:bg-blue-500 text-white'
                    : 'bg-slate-600 hover:bg-slate-500 text-white'
                }`}
              >
                {tier.cta}
              </button>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <h3 className="text-2xl font-semibold mb-4">Need more?</h3>
          <p className="text-slate-400">
            We offer custom enterprise plans for large-scale deployments.
            <a href="#" className="text-blue-400 hover:underline ml-2">
              Contact Sales
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
