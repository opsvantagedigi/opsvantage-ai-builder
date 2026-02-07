import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { Plan } from '@prisma/client';

/**
 * Verifies the signature of the NowPayments subscription IPN request.
 */
function verifySignature(payload: string, signature: string | null): boolean {
  const ipnSecret = process.env.NOWPAYMENTS_SUBSCRIPTION_IPN_SECRET_KEY;
  if (!ipnSecret || !signature) {
    logger.warn({ msg: 'Subscription IPN secret or signature missing, skipping verification.' });
    return !ipnSecret;
  }

  const hmac = crypto.createHmac('sha512', ipnSecret);
  hmac.update(payload, 'utf-8');
  const expectedSignature = hmac.digest('hex');

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}

/**
 * Webhook to handle recurring subscription payment notifications from NowPayments.
 */
export async function POST(request: Request) {
  const bodyText = await request.text();
  const signature = headers().get('x-nowpayments-sig');

  if (!verifySignature(bodyText, signature)) {
    logger.error({ msg: 'Invalid NowPayments subscription signature.' });
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  try {
    const payload = JSON.parse(bodyText);
    const { subscription_id: subscriptionId, status, plan_id: planId, next_payment_date: nextPaymentDate } = payload;

    logger.info({ msg: 'Received NowPayments Subscription IPN', subscriptionId, status });

    // Find the workspace associated with this subscription
    const workspace = await prisma.workspace.findUnique({
      where: { stripeSubscriptionId: subscriptionId },
    });

    if (!workspace) {
      logger.error({ msg: 'Webhook received for non-existent workspace subscription', subscriptionId });
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    let newPlan: Plan = workspace.plan;
    let newPeriodEnd: Date | null = workspace.stripeCurrentPeriodEnd;

    if (status === 'active') {
      // Determine the plan based on the plan_id from NowPayments
      if (String(planId) === process.env.NOWPAYMENTS_PRO_PLAN_ID) {
        newPlan = Plan.PRO;
      } else if (String(planId) === process.env.NOWPAYMENTS_AGENCY_PLAN_ID) {
        newPlan = Plan.AGENCY;
      }
      newPeriodEnd = new Date(nextPaymentDate);
      logger.info({ msg: 'Activating/Renewing subscription', workspaceId: workspace.id, newPlan, newPeriodEnd });
    } else if (['expired', 'cancelled'].includes(status)) {
      // Downgrade the plan if the subscription is no longer active
      newPlan = Plan.FREE;
      newPeriodEnd = null;
      logger.info({ msg: 'Deactivating subscription', workspaceId: workspace.id });
    }

    // Update the workspace record if there's a change
    if (newPlan !== workspace.plan) {
      await prisma.workspace.update({
        where: { id: workspace.id },
        data: {
          plan: newPlan,
          stripeCurrentPeriodEnd: newPeriodEnd,
        },
      });
    }

    return NextResponse.json({ ok: true });

  } catch (error: any) {
    logger.error({ msg: 'Error processing NowPayments subscription webhook', error: error.message });
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}