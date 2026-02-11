'use client';

import { useEffect, useState } from 'react';
import { Check, CreditCard, Loader2, ArrowRight } from 'lucide-react';
import { createBillingSessionAction, getCurrentSubscriptionAction } from '@/app/actions/billing';
import { SUBSCRIPTION_PLANS } from '@/config/subscriptions';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { DashboardShell } from '@/components/layout/DashboardShell';

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

    void loadSubscription();
  }, []);

  const handleSelectPlan = async (planId: string) => {
    setIsProcessing(true);
    if (subscription?.plan === planId) {
      await createBillingSessionAction();
    } else {
      await createBillingSessionAction(planId);
    }
    setIsProcessing(false);
  };

  if (isLoading) {
    return (
      <DashboardShell title="Subscription & Billing" description="Manage plans, usage limits, and billing operations.">
        <div className="flex min-h-[300px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell title="Subscription & Billing" description="Manage your plan, usage limits, and payment workflows.">
      <div className="space-y-8">
        {subscription && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-cyan-200 bg-gradient-to-r from-cyan-50 to-blue-50 p-6 dark:border-cyan-900/50 dark:from-cyan-950/40 dark:to-blue-950/40"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-300">Current Plan</p>
                <h2 className="mt-1 text-3xl font-semibold text-slate-900 dark:text-slate-100">{subscription.planName}</h2>
              </div>
              <div className="text-left md:text-right">
                <p className="text-sm text-slate-600 dark:text-slate-300">Status</p>
                <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                  <span
                    className={cn(
                      'h-2.5 w-2.5 rounded-full',
                      subscription.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500',
                    )}
                  />
                  {subscription.status || 'none'}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <UsageMeter
                label="AI Generations"
                used={subscription.usage.aiGenerations.used}
                limit={subscription.usage.aiGenerations.limit}
                gradient="from-cyan-500 to-blue-500"
              />
              <UsageMeter
                label="Sites Published"
                used={subscription.usage.sites.used}
                limit={subscription.usage.sites.limit}
                gradient="from-emerald-500 to-teal-500"
              />
            </div>

            {subscription.currentPeriodEnd && (
              <p className="mt-5 text-sm text-slate-600 dark:text-slate-300">
                Renews on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </p>
            )}
          </motion.section>
        )}

        <section>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Choose your plan</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {SUBSCRIPTION_PLANS.map((plan, index) => (
              <motion.article
                key={plan.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  'relative flex h-full flex-col rounded-2xl border p-6',
                  subscription?.plan === plan.id
                    ? 'border-cyan-500 bg-cyan-50 dark:border-cyan-500 dark:bg-cyan-950/30'
                    : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900',
                )}
              >
                {plan.isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-cyan-600 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-white dark:bg-cyan-500 dark:text-slate-950">
                    Popular
                  </span>
                )}

                <h4 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{plan.name}</h4>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{plan.description}</p>
                <p className="mt-4 text-3xl font-semibold text-slate-900 dark:text-slate-100">
                  ${plan.price}
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">/month</span>
                </p>

                <ul className="mt-5 space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200">
                      <Check className="mt-0.5 h-4 w-4 text-emerald-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={isProcessing}
                  className={cn(
                    'mt-6 w-full gap-2 !normal-case !tracking-normal',
                    subscription?.plan === plan.id
                      ? 'bg-slate-900 text-white hover:bg-slate-700 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400'
                      : 'bg-white text-slate-900 ring-1 ring-slate-300 hover:bg-slate-100 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white',
                  )}
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : subscription?.plan === plan.id ? (
                    <>
                      <CreditCard className="h-4 w-4" />
                      Manage Plan
                    </>
                  ) : (
                    <>
                      <ArrowRight className="h-4 w-4" />
                      Upgrade
                    </>
                  )}
                </Button>
              </motion.article>
            ))}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}

function UsageMeter({
  label,
  used,
  limit,
  gradient,
}: {
  label: string;
  used: number;
  limit: number;
  gradient: string;
}) {
  const width = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;

  return (
    <div>
      <p className="mb-2 flex items-center justify-between text-sm text-slate-700 dark:text-slate-200">
        <span>{label}</span>
        <span className="font-semibold">
          {used}/{limit}
        </span>
      </p>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <motion.div
          className={`h-full bg-gradient-to-r ${gradient}`}
          initial={{ width: 0 }}
          animate={{ width: `${width}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>
    </div>
  );
}