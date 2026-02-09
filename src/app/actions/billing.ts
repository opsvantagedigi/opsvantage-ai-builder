'use server';

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';
import { SUBSCRIPTION_PLANS } from '@/config/subscriptions';

/**
 * 💳 BILLING ACTION: Create Stripe Checkout or Portal Session
 *
 * If user has NO plan:
 * - Create Checkout session for first purchase
 *
 * If user HAS a plan:
 * - Open Stripe Customer Portal (manage billing, upgrade, cancel, invoices)
 */
export async function createBillingSessionAction(planId?: string) {
  try {
    // 1. Authenticate
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { error: 'Unauthorized - please sign in' };
    }

    // 2. Get user from database
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        stripeCustomerId: true,
        stripePriceId: true,
      },
    });

    if (!user) {
      return { error: 'User not found' };
    }

    const billingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`;

    // 3. IF USER IS ALREADY A CUSTOMER -> OPEN PORTAL
    if (user.stripeCustomerId) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: billingUrl,
      });

      if (!stripeSession.url) {
        return { error: 'Failed to create billing portal session' };
      }

      redirect(stripeSession.url);
    }

    // 4. IF USER IS NEW -> OPEN CHECKOUT
    // Determine which plan (default to Pro if not specified)
    const selectedPlanId = planId || 'pro';
    const selectedPlan = SUBSCRIPTION_PLANS.find((p) => p.id === selectedPlanId);

    if (!selectedPlan || !selectedPlan.stripePriceId) {
      return { error: `Plan ${selectedPlanId} not found or not configured` };
    }

    // 5. Create Stripe Checkout Session
    const stripeSession = await stripe.checkout.sessions.create({
      success_url: `${billingUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: billingUrl,
      payment_method_types: ['card'],
      mode: 'subscription',
      billing_address_collection: 'auto',
      customer_email: user.email,
      line_items: [
        {
          price: selectedPlan.stripePriceId,
          quantity: 1,
        },
      ],
      metadata: {
        userId: user.id,
        planId: selectedPlanId,
      },
    });

    if (!stripeSession.url) {
      return { error: 'Failed to create checkout session' };
    }

    redirect(stripeSession.url);
  } catch (error) {
    console.error('[MARZ] Billing action error:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to create billing session',
    };
  }
}

/**
 * Get user's current subscription info
 */
export async function getCurrentSubscriptionAction() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { error: 'Unauthorized' };
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        stripePriceId: true,
        stripeCurrentPeriodEnd: true,
        subscriptionStatus: true,
        aiGenerationsUsed: true,
        sitesPublished: true,
      },
    });

    if (!user) {
      return { error: 'User not found' };
    }

    // Find the plan
    const plan = SUBSCRIPTION_PLANS.find((p) => p.stripePriceId === user.stripePriceId);

    return {
      success: true,
      subscription: {
        plan: plan?.id || null,
        planName: plan?.name || 'None',
        status: user.subscriptionStatus,
        currentPeriodEnd: user.stripeCurrentPeriodEnd,
        usage: {
          aiGenerations: {
            used: user.aiGenerationsUsed,
            limit: plan?.limits.aiGenerations || 0,
          },
          sites: {
            used: user.sitesPublished,
            limit: plan?.limits.sites || 0,
          },
        },
      },
    };
  } catch (error) {
    console.error('[MARZ] Get subscription error:', error);
    return { error: 'Failed to get subscription' };
  }
}
