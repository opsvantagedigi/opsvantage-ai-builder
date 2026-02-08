'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Zap,
  Rocket,
  Check,
  ArrowRight,
  Mail,
  Star,
  Clock,
  Users,
  TrendingUp,
} from 'lucide-react';

const LAUNCH_DATE = new Date('2026-02-27T00:00:00Z');

interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function ComingSoonPage() {
  const [countdown, setCountdown] = useState<CountdownTime>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const diff = LAUNCH_DATE.getTime() - now.getTime();

      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || submitted) return;

    setIsLoading(true);
    try {
      // TODO: Send email to your backend/email service
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSubmitted(true);
      setEmail('');
      setTimeout(() => setSubmitted(false), 3000);
    } catch (error) {
      console.error('Error submitting email:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: Zap,
      title: 'AI-Powered Generation',
      description: 'Create stunning websites in minutes with AI assistance',
    },
    {
      icon: Rocket,
      title: 'Instant Deployment',
      description: 'Publish your site live with a single click',
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Invite team members and work together seamlessly',
    },
    {
      icon: TrendingUp,
      title: 'Advanced Analytics',
      description: 'Track performance and optimize your websites',
    },
  ];

  const pricingTiers = [
    {
      name: 'Starter',
      price: 29,
      description: 'Perfect for solopreneurs',
      features: [
        '1 published website',
        '50 AI generations/month',
        'Basic support',
        'Standard templates',
      ],
    },
    {
      name: 'Pro',
      price: 49,
      description: 'For growing brands',
      features: [
        '3 published websites',
        '500 AI generations/month',
        'Custom domains',
        'Priority support',
        'Advanced templates',
        'Basic analytics',
      ],
      isPopular: true,
    },
    {
      name: 'Agency',
      price: 199,
      description: 'White-label power',
      features: [
        '20 published websites',
        '5000 AI generations/month',
        'Unlimited custom domains',
        '24/7 premium support',
        'Premium templates',
        'Advanced analytics',
        'Team invitations (5)',
        'API access',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-900/20 to-slate-950 text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-cyan-500/20 backdrop-blur bg-slate-900/30 sticky top-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Rocket className="w-8 h-8 text-cyan-500" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  OpsVantage AI Builder
                </h1>
              </div>
              <div className="text-sm text-slate-400">
                Coming {LAUNCH_DATE.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Build{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                Beautiful Websites
              </span>
              <br />
              With AI Power
            </h2>

            <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
              Create, customize, and deploy stunning websites in minutes. No coding required. Powered by advanced AI.
            </p>
          </motion.div>

          {/* Countdown Timer */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="my-12"
          >
            <div className="inline-block">
              <p className="text-cyan-400 text-sm font-semibold mb-4 uppercase tracking-widest flex items-center gap-2 justify-center">
                <Clock className="w-4 h-4" />
                Launch Countdown
              </p>

              <div className="grid grid-cols-4 gap-4 mb-8">
                {[
                  { value: countdown.days, label: 'Days' },
                  { value: countdown.hours, label: 'Hours' },
                  { value: countdown.minutes, label: 'Minutes' },
                  { value: countdown.seconds, label: 'Seconds' },
                ].map((item, idx) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 * idx }}
                    className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-lg p-6 backdrop-blur"
                  >
                    <div className="text-4xl font-bold text-cyan-400 tabular-nums">
                      {String(item.value).padStart(2, '0')}
                    </div>
                    <div className="text-sm text-slate-400 mt-2">{item.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Early Access Signup */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="max-w-md mx-auto mb-12"
          >
            {submitted ? (
              <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 text-green-300 flex items-center gap-3">
                <Check className="w-5 h-5 flex-shrink-0" />
                <span>Thanks! Watch for launch updates.</span>
              </div>
            ) : (
              <form onSubmit={handleEmailSubmit} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email for early access..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-slate-900/50 border-cyan-500/30 text-white placeholder-slate-500"
                />
                <Button
                  type="submit"
                  disabled={!email || isLoading}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white gap-2"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-transparent border-t-white rounded-full animate-spin" />
                  ) : (
                    <Mail className="w-4 h-4" />
                  )}
                  Notify Me
                </Button>
              </form>
            )}
          </motion.div>
        </section>

        {/* Features Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h3 className="text-3xl font-bold text-center mb-12">
            Powerful Features Launching Soon
          </h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-cyan-500/20 rounded-lg p-6 hover:border-cyan-500/50 transition-all"
                >
                  <Icon className="w-8 h-8 text-cyan-400 mb-3" />
                  <h4 className="text-lg font-bold mb-2">{feature.title}</h4>
                  <p className="text-slate-400 text-sm">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Pricing Preview */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h3 className="text-3xl font-bold text-center mb-4">Flexible Pricing Plans</h3>
          <p className="text-center text-slate-400 mb-12 max-w-2xl mx-auto">
            Choose the perfect plan for your needs. All plans include core features.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {pricingTiers.map((tier, idx) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`relative rounded-2xl border-2 p-8 ${
                  tier.isPopular
                    ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/50 shadow-2xl shadow-cyan-500/20'
                    : 'bg-slate-900/50 border-slate-700/50'
                }`}
              >
                {tier.isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-1 rounded-full text-sm font-bold flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h4 className="text-2xl font-bold mb-2">{tier.name}</h4>
                  <p className="text-slate-400 text-sm mb-4">{tier.description}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">${tier.price}</span>
                    <span className="text-slate-400">/month</span>
                  </div>
                </div>

                <ul className="space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  disabled
                  className={`w-full mt-8 gap-2 ${
                    tier.isPopular
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                      : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                  }`}
                >
                  Coming Soon
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-2xl p-12"
          >
            <h3 className="text-3xl font-bold mb-4">Ready to Build?</h3>
            <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
              Get notified when we launch. Be the first to experience the future of website building.
            </p>
            <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-3 gap-2">
              <Mail className="w-4 h-4" />
              Join the Waitlist
              <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-700/50 mt-20 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center text-slate-400 text-sm">
              <div>© 2026 OpsVantage AI Builder. All rights reserved.</div>
              <div className="flex gap-6 mt-4 md:mt-0">
                <a href="#" className="hover:text-cyan-400 transition">Privacy</a>
                <a href="#" className="hover:text-cyan-400 transition">Terms</a>
                <a href="#" className="hover:text-cyan-400 transition">Contact</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
