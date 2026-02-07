import { prisma } from '@/lib/prisma';
import { Plan } from '@prisma/client';

export const PLAN_LIMITS = {
  [Plan.FREE]: {
    projects: 1,
    customDomains: 0,
    agency: false,
  },
  [Plan.PRO]: {
    projects: 5,
    customDomains: 1,
    agency: false,
  },
  [Plan.AGENCY]: {
    projects: Infinity,
    customDomains: Infinity,
    agency: true,
  },
};

export async function checkSubscription(workspaceId: string) {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: {
      id: true,
      name: true,
      type: true,
      createdAt: true,
      updatedAt: true,
      slug: true,
      ownerId: true,
      plan: true,
      stripeCurrentPeriodEnd: true,
      _count: {
        select: { projects: true },
      },
    },
  });

  if (!workspace) {
    throw new Error('Workspace not found.');
  }

  const plan = workspace.plan;
  const limits = PLAN_LIMITS[plan];

  // Check if the subscription is active (for paid plans)
  const isPaid = plan !== Plan.FREE;
  const isActive = isPaid ? workspace.stripeCurrentPeriodEnd && workspace.stripeCurrentPeriodEnd.getTime() > Date.now() : true;

  return {
    plan,
    isActive,
    limits,
    usage: {
      projects: workspace._count.projects,
    },
  };
}