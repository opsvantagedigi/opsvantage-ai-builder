'use server';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';
import { verifySession } from '@/lib/verify-session';
import { checkSubscription } from '@/lib/subscription';

export async function addCustomDomainAction(projectId: string, domain: string) {
  // Verify session using the standardized method
  const session = await verifySession();
  if (!session) {
    return { error: 'User not authenticated: No session found.' };
  }

  const userId = session.sub;
  if (!userId) {
    return { error: 'User not authenticated: No user ID in session.' };
  }

  // 1. Find project and verify ownership/membership
  const project = await prisma.project.findFirst({
    where: { id: projectId, deletedAt: null },
    include: {
      workspace: { include: { members: true } },
    },
  }) as { id: string, workspaceId: string, workspace: { members: Array<{ userId: string }> } };

  if (!project || !Array.isArray(project.workspace.members) || !project.workspace.members.some((m) => m.userId === userId)) {
    return { error: 'Project not found or you do not have access.' };
  }

  // 2. Check subscription plan
  const subscription = await checkSubscription(project.workspaceId);
  if (!subscription.isActive || subscription.limits.customDomains === 0) {
    return { error: 'Your current plan does not support custom domains. Please upgrade your plan.' };
  }

  try {
    // 2. Save domain to our database (skip Vercel integration for Google Cloud deployment)
    await prisma.domain.create({
      data: {
        projectId: project.id,
        hostname: domain,
      },
    });

    // 3. Return success message
    return {
      success: true,
      message: `Domain ${domain} added successfully. Note: Vercel integration skipped for Google Cloud deployment.`,
      configuration: {},
    };

  } catch (error) {
    logger.error(`Failed to add custom domain: ${(error as Error).message}`);
    return { error: (error as Error).message || 'An unexpected error occurred.' };
  }
}