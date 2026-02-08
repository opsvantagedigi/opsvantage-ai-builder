'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, CreditCard, Loader2, ArrowRight } from 'lucide-react';
import { createBillingSessionAction, getCurrentSubscriptionAction } from '@/app/actions/billing';
import { SUBSCRIPTION_PLANS } from '@/config/subscriptions';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface UserSubscription {
  plan: string | null;
  planName: string;
  status: string | null;
  currentPeriodEnd: Date | null;
  usage: {
    aiGenerations: { used: number; limit: number };
    sites: { used: number; limit: number };
  };
}

export default function BillingPage() {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const loadSubscription = async () => {
      const result = await getCurrentSubscriptionAction();
      if (!result.error && result.subscription) {
        setSubscription(result.subscription);
      }
      setIsLoading(false);
    };
    loadSubscription();
  }, []);

  const handleSelectPlan = async (planId: string) => {
    if (subscription?.plan === planId) {
      // Already on this plan, open portal
      setIsProcessing(true);
      await createBillingSessionAction();
    } else {
      // Switch to this plan
      setIsProcessing(true);
      await createBillingSessionAction(planId);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2">Subscription & Billing</h1>
          <p className="text-slate-400">
            Manage your plan, usage, and billing information
          </p>
        </div>

        {/* Current Plan & Usage */}
        {subscription && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-6 space-y-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Current Plan</p>
                <h2 className="text-3xl font-bold">{subscription.planName}</h2>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400 mb-1">Status</p>
                <div className="flex items-center gap-2 justify-end">
                  <span
                    className={cn(
                      'w-2 h-2 rounded-full',
                      subscription.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
                    )}
                  />
                  <span className="capitalize font-semibold">
                    {subscription.status || 'None'}
                  </span>
                </div>
              </div>
            </div>

            {/* Usage Meters */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* AI Generations */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">AI Generations</span>
                  <span className="text-cyan-400 font-semibold">
                    {subscription.usage.aiGenerations.used}/{subscription.usage.aiGenerations.limit}
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${
                        (subscription.usage.aiGenerations.used /
                          subscription.usage.aiGenerations.limit) *
                        100
                      }%`,
                    }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Sites Published */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Sites Published</span>
                  <span className="text-cyan-400 font-semibold">
                    {subscription.usage.sites.used}/{subscription.usage.sites.limit}
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${
                        (subscription.usage.sites.used / subscription.usage.sites.limit) *
                        100
                      }%`,
                    }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            </div>

            {subscription.currentPeriodEnd && (
              <div className="pt-4 border-t border-slate-700">
                <p className="text-sm text-slate-400">
                  Renews on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Plan Selection */}
        <div>
          <h3 className="text-xl font-bold mb-6">Choose Your Plan</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {SUBSCRIPTION_PLANS.map((plan, idx) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={cn(
                  'relative rounded-2xl border-2 p-6 space-y-6 transition-all',
                  subscription?.plan === plan.id
                    ? 'bg-blue-900/20 border-blue-500 shadow-lg shadow-blue-500/20'
                    : 'bg-slate-900/50 border-slate-700 hover:border-slate-600'
                )}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-1 rounded-full text-sm font-bold">
                      Popular
                    </span>
                  </div>
                )}

                <div>
                  <h4 className="text-2xl font-bold">{plan.name}</h4>
                  <p className="text-slate-400 text-sm mt-1 mb-4">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-slate-400">/month</span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={isProcessing}
                  className={cn(
                    'w-full font-semibold gap-2',
                    subscription?.plan === plan.id
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-white text-black hover:bg-slate-100'
                  )}
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : subscription?.plan === plan.id ? (
                    <>
                      <CreditCard className="w-4 h-4" />
                      Manage Plan
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-4 h-4" />
                      Upgrade
                    </>
                  )}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
