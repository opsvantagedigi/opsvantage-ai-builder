import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/lib/stripe';
import { db } from '@/lib/db';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * 🪝 STRIPE WEBHOOK: Listen for payment events
 *
 * This endpoint receives events from Stripe and updates our database accordingly.
 * Critical events:
 * - customer.subscription.created: Store subscription in DB
 * - customer.subscription.updated: Update subscription status
 * - customer.subscription.deleted: Mark as canceled
 * - invoice.payment_succeeded: Record payment
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();

    if (!webhookSecret) {
      console.error('[MARZ] STRIPE_WEBHOOK_SECRET is not configured');
      return NextResponse.json(
        { error: 'Webhook not configured' },
        { status: 500 }
      );
    }

    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // 1. Verify the webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('[MARZ] Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // 2. Handle different event types
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionCreatedOrUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[MARZ] Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Handle subscription created or updated
 */
async function handleSubscriptionCreatedOrUpdated(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string;
    const priceId = subscription.items.data[0]?.price.id;

    if (!customerId || !priceId) {
      console.error('[MARZ] Missing customerId or priceId in subscription');
      return;
    }

    // Find user by Stripe customer ID
    const user = await db.user.findFirst({
      where: { stripeCustomerId: customerId },
    });

    if (!user) {
      console.error(`[MARZ] User not found for Stripe customer ${customerId}`);
      return;
    }

    // Determine plan ID from price ID
    const planId = getPlanIdFromPriceId(priceId);

    // Update user with subscription info
    const subData = subscription as any;
    await db.user.update({
      where: { id: user.id },
      data: {
        stripeSubscriptionId: subscription.id,
        stripePriceId: priceId,
        stripeCurrentPeriodEnd: new Date(subData.current_period_end * 1000),
        subscriptionStatus: subscription.status,
      },
    });

    // Create subscription record for history
    await db.subscription.upsert({
      where: { stripeSubscriptionId: subscription.id },
      create: {
        userId: user.id,
        stripeSubscriptionId: subscription.id,
        stripePriceId: priceId,
        stripeCustomerId: customerId,
        plan: planId,
        status: subscription.status,
        currentPeriodStart: new Date(subData.current_period_start * 1000),
        currentPeriodEnd: new Date(subData.current_period_end * 1000),
      },
      update: {
        status: subscription.status,
        currentPeriodStart: new Date(subData.current_period_start * 1000),
        currentPeriodEnd: new Date(subData.current_period_end * 1000),
      },
    });

  } catch (error) {
    console.error('[MARZ] Error handling subscription created/updated:', error);
    throw error;
  }
}

/**
 * Handle subscription deleted (canceled)
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string;

    const user = await db.user.findFirst({
      where: { stripeCustomerId: customerId },
    });

    if (!user) {
      console.error(`[MARZ] User not found for Stripe customer ${customerId}`);
      return;
    }

    // Mark subscription as canceled
    await db.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: 'canceled',
        stripeSubscriptionId: null,
      },
    });

    // Update subscription record
    await db.subscription.update({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        status: 'canceled',
        canceledAt: new Date(),
      },
    });

  } catch (error) {
    console.error('[MARZ] Error handling subscription deleted:', error);
    throw error;
  }
}

/**
 * Handle successful invoice payment
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    const invoiceData = invoice as any;
    if (!invoiceData.subscription) {
      return;
    }

    const customerId = invoiceData.customer as string;
    const user = await db.user.findFirst({
      where: { stripeCustomerId: customerId },
    });

    if (!user) {
      return;
    }

  } catch (error) {
    console.error('[MARZ] Error handling invoice payment succeeded:', error);
    throw error;
  }
}

/**
 * Handle failed invoice payment
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  try {
    const invoiceData = invoice as any;
    if (!invoiceData.subscription) {
      return;
    }

    const customerId = invoiceData.customer as string;
    const user = await db.user.findFirst({
      where: { stripeCustomerId: customerId },
    });

    if (!user) {
      return;
    }

    // Mark subscription as past due
    await db.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: 'past_due',
      },
    });

  } catch (error) {
    console.error('[MARZ] Error handling invoice payment failed:', error);
    throw error;
  }
}

/**
 * Map Stripe price ID to plan ID
 * This should match your SUBSCRIPTION_PLANS config
 */
function getPlanIdFromPriceId(priceId: string): string {
  const planMap: { [key: string]: string } = {
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER || '']: 'starter',
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO || '']: 'pro',
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_AGENCY || '']: 'agency',
  };

  return planMap[priceId] || 'unknown';
}
