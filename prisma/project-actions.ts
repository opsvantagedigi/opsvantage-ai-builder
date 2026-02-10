'use server';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { checkSubscription } from '@/lib/subscription';

export async function addCustomDomainAction(projectId: string, domain: string) {
  // Manually verify the session using the JWT token from cookies
  const cookieStore = await cookies();
  const token = cookieStore.get('next-auth.session-token')?.value || 
               cookieStore.get('__Secure-next-auth.session-token')?.value;
  
  if (!token) {
    return { error: 'User not authenticated: No session token.' };
  }

  let sessionPayload;
  try {
    // Verify the JWT token using the NEXTAUTH_SECRET
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
    sessionPayload = await jwtVerify(token, secret);
  } catch (error) {
    console.error('Session verification failed:', error);
    return { error: 'User not authenticated: Invalid session.' };
  }

  // Extract user ID from the verified token
  const userId = sessionPayload.payload.sub as string;
  if (!userId) {
    return { error: 'User not authenticated: No user ID in session.' };
  }

  // 1. Find project and verify ownership/membership
  const project = await prisma.project.findUnique({
    where: { id: projectId },
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