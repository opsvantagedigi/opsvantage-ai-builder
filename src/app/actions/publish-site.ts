'use server';

import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { addDomain, checkDomainConfig } from '@/lib/vercel';
import { getServerSession } from 'next-auth/next';
import { getPlanIdFromStripePrice, getUsageLimit } from '@/config/subscriptions';

interface PublishResult {
  success: boolean;
  url?: string;
  error?: string;
  customDomainStatus?: {
    verified: boolean;
    nameservers: string[];
    requiredNameservers: string[];
  };
}

/**
 * 🚀 PUBLISH ACTION: Deploys a site to the internet
 *
 * Steps:
 * 1. Validate user owns the project
 * 2. Validate user has active subscription and usage limits allow it
 * 3. If custom domain provided: add to Vercel, check DNS config
 * 4. Mark project as published
 * 5. Return live URL
 */
export async function publishSiteAction(
  projectId: string,
  customDomain?: string
): Promise<PublishResult> {
  try {
    // 1. AUTHENTICATE
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return {
        success: false,
        error: 'Unauthorized - please sign in',
      };
    }

    // 2. VERIFY PROJECT OWNERSHIP
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: { workspace: true },
    });

    if (!project) {
      return {
        success: false,
        error: 'Project not found',
      };
    }

    // Check if user has access to this project's workspace
    const hasAccess = await db.workspaceMember.findFirst({
      where: {
        user: {
          email: session.user.email,
        },
        workspaceId: project.workspaceId,
      },
    });

    if (!hasAccess && project.workspace.ownerId !== (session.user as any).id) {
      return {
        success: false,
        error: 'Unauthorized - you do not own this project',
      };
    }

    // 3. VALIDATE PROJECT HAS CONTENT
    if (!project.content) {
      return {
        success: false,
        error: 'Cannot publish empty project - add sections first',
      };
    }

    // 4. VALIDATE SUBSCRIPTION
    const user = await db.user.findUnique({
      where: { id: (session.user as any).id },
    });

    if (!user || user.subscriptionStatus !== 'active') {
      return {
        success: false,
        error: 'Active subscription required to publish. Upgrade your plan.',
      };
    }

    // Check site limits
    const publishedSiteCount = await db.project.count({
      where: {
        workspaceId: project.workspaceId,
        published: true,
      },
    });

    // Get user plan from stripe price ID
    const planId = user.stripePriceId ? getPlanIdFromStripePrice(user.stripePriceId) : null;
    const siteLimit = getUsageLimit(planId, 'sites');

    if (publishedSiteCount >= siteLimit) {
      return {
        success: false,
        error: `Site limit reached for your plan. You can publish ${siteLimit} sites. Upgrade to publish more.`,
      };
    }

    // 5. HANDLE CUSTOM DOMAIN (if provided)
    let liveUrl: string | null = null;
    let customDomainStatus: { verified: boolean; nameservers: string[]; requiredNameservers: string[]; } | undefined;

    if (customDomain) {
      try {
        console.log(`[MARZ] Adding custom domain to Vercel: ${customDomain}`);

        // Add domain to Vercel
        await addDomain(customDomain);

        // Check domain configuration
        const configStatus = await checkDomainConfig(customDomain);
        customDomainStatus = {
          verified: configStatus.verified,
          nameservers: configStatus.nameservers,
          requiredNameservers: configStatus.requiredNameservers,
        };

        liveUrl = `https://${customDomain}`;
      } catch (error) {
        console.error('[MARZ] Custom domain setup failed:', error);
        return {
          success: false,
          error: `Failed to configure custom domain: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
      }
    } else {
      // Generate subdomain URL if no custom domain
      const subdomain = project.subdomain || project.id;
      const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'opsvantage.online';
      liveUrl = `https://${subdomain}.${rootDomain}`;
    }

    // 5. UPDATE PROJECT STATUS IN DATABASE
    await db.project.update({
      where: { id: projectId },
      data: {
        published: true,
        customDomain: customDomain || null,
        subdomain: project.subdomain || projectId,
        publishedAt: new Date(),
      },
    });

    console.log(`[MARZ] Project published: ${projectId} -> ${liveUrl}`);

    return {
      success: true,
      url: liveUrl,
      customDomainStatus,
    };
  } catch (error) {
    console.error('[MARZ] Publish failed:', error);
    return {
      success: false,
      error: `Publish failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Check the DNS configuration status for a custom domain
 */
export async function checkDomainStatusAction(customDomain: string) {
  try {
    const status = await checkDomainConfig(customDomain);
    return {
      success: true,
      status,
    };
  } catch (error) {
    console.error('[MARZ] Domain check failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check domain',
    };
  }
}
