/**
 * 💰 SUBSCRIPTION TIERS: Define your pricing and feature limits
 *
 * This is the "Single Source of Truth" for all plan information.
 * Used by:
 * - Pricing page (show plans)
 * - Paywall logic (check if user can access feature)
 * - Checkout (which product to create)
 * - Dashboard (show usage meters)
 */

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  stripePriceId: string | undefined;
  limits: {
    sites: number;
    aiGenerations: number;
    customDomains: boolean;
  };
  isPopular?: boolean;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for solopreneurs testing ideas.',
    price: 29,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER,
    limits: {
      sites: 1,
      aiGenerations: 50,
      customDomains: false, // Subdomain only
    },
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For growing brands and serious builders.',
    price: 49,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO,
    limits: {
      sites: 3,
      aiGenerations: 500,
      customDomains: true, // Can use custom domains
    },
    isPopular: true,
  },
  {
    id: 'agency',
    name: 'Agency',
    description: 'White-label power for digital agencies.',
    price: 199,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_AGENCY,
    limits: {
      sites: 20,
      aiGenerations: 5000,
      customDomains: true,
    },
  },
];

/**
 * Get a plan by ID
 */
export function getPlanById(planId: string): SubscriptionPlan | undefined {
  return SUBSCRIPTION_PLANS.find((p) => p.id === planId);
}

/**
 * Check if user can access a feature based on their plan
 */
export function canAccessFeature(
  planId: string | null | undefined,
  feature: 'customDomain' | 'multipleSites'
): boolean {
  if (!planId) return false; // Free users can't access anything

  const plan = getPlanById(planId);
  if (!plan) return false;

  switch (feature) {
    case 'customDomain':
      return plan.limits.customDomains;
    case 'multipleSites':
      return plan.limits.sites > 1;
    default:
      return false;
  }
}

/**
 * Get usage limit for a plan
 */
export function getUsageLimit(planId: string | null | undefined, type: 'sites' | 'generations'): number {
  if (!planId) return 0;

  const plan = getPlanById(planId);
  if (!plan) return 0;

  return type === 'sites' ? plan.limits.sites : plan.limits.aiGenerations;
}

/**
 * Get plan ID from Stripe price ID
 */
export function getPlanIdFromStripePrice(priceId: string): string {
  const planMap: { [key: string]: string } = {
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER || '']: 'starter',
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO || '']: 'pro',
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_AGENCY || '']: 'agency',
  };

  return planMap[priceId] || 'unknown';
}
