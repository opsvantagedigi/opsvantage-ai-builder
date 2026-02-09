'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { vercel } from '@/lib/vercel/client';
import { logger } from '@/lib/logger';
import { checkSubscription } from '@/lib/subscription';

export async function addCustomDomainAction(projectId: string, domain: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: 'User not authenticated.' };
  }
  const userId = session.user.id;

  // 1. Find project and verify ownership/membership
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      workspace: { include: { members: true } },
    },
  }) as { vercelProjectId?: string, id: string, workspaceId: string, workspace: { members: Array<{ userId: string }> } };

  if (!project || !Array.isArray(project.workspace.members) || !project.workspace.members.some((m) => m.userId === userId)) {
    return { error: 'Project not found or you do not have access.' };
  }

  if (!project.vercelProjectId) {
    return { error: 'Vercel project ID is not configured for this project.' };
  }

  // 2. Check subscription plan
  const subscription = await checkSubscription(project.workspaceId);
  if (!subscription.isActive || subscription.limits.customDomains === 0) {
    return { error: 'Your current plan does not support custom domains. Please upgrade your plan.' };
  }

  try {
    // 2. Add domain to Vercel
    await vercel.addDomainToProject(project.vercelProjectId, domain);
    logger.info(`Domain added to Vercel project: ${JSON.stringify({ vercelProjectId: project.vercelProjectId, domain })}`);

    // 3. Save domain to our database
    await prisma.domain.create({
      data: {
        projectId: project.id,
        hostname: domain,
      },
    });

    // 4. Return the configuration details needed by the user
    return {
      success: true,
      message: `Domain ${domain} added successfully.`,
      configuration: {}, // Stub, as our vercel client does not return verification
    };

  } catch (error) {
    logger.error(`Failed to add custom domain: ${(error as Error).message}`);
    return { error: (error as Error).message || 'An unexpected error occurred.' };
  }
}