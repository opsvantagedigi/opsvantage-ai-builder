'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { nowPayments } from '@/lib/nowpayments/client';
import { Plan } from '@prisma/client';

const planIds = {
  PRO: process.env.NOWPAYMENTS_PRO_PLAN_ID,
  AGENCY: process.env.NOWPAYMENTS_AGENCY_PLAN_ID,
};

export async function createSubscriptionAction(workspaceId: string, plan: 'PRO' | 'AGENCY') {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: 'User not authenticated.' };
  }

  // 1. Verify user has access to the workspace
  const workspace = await prisma.workspace.findFirst({
    where: {
      id: workspaceId,
      members: { some: { userId: session.user.id } },
    },
  });

  if (!workspace) {
    return { error: 'Workspace not found or you do not have access.' };
  }

  const planId = planIds[plan];
  if (!planId) {
    return { error: `Plan ID for ${plan} is not configured.` };
  }

  try {
    // 2. Create a subscription payment with NowPayments
    const subscription = await nowPayments.createSubscription({
      plan_id: parseInt(planId),
      // IMPORTANT: Replace with your actual production URL
      ipn_callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/nowpayments-subscriptions`,
    });

    if (!subscription.invoice_url) {
      throw new Error('Failed to create subscription invoice.');
    }

    // 3. Update workspace with the pending subscription details
    await prisma.workspace.update({
      where: { id: workspaceId },
      data: { stripeSubscriptionId: subscription.subscription_id }, // Using stripe field for now
    });

    // 4. Return the payment URL to the client for redirection
    return { paymentUrl: subscription.invoice_url };
  } catch (error: any) {
    console.error("Subscription Creation Error:", error);
    return { error: error.message || "Failed to create subscription." };
  }
}