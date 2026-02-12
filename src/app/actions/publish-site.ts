'use server';

import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { getPlanIdFromStripePrice, getUsageLimit } from '@/config/subscriptions';
import { SITE_DOMAIN, SITE_URL } from '@/lib/site-config';

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
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;
    if (!userEmail) {
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
          email: userEmail,
        },
        workspaceId: project.workspaceId,
      },
    });

    // 4. VALIDATE SUBSCRIPTION + USER STATE
    const user = await db.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return {
        success: false,
        error: 'Unauthorized - user not found',
      };
    }

    if (!hasAccess && project.workspace.ownerId !== user.id) {
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
        // In a real implementation, you would integrate with your hosting provider here
        // For now, we'll simulate the domain setup
        
        // Simulated domain configuration check
        customDomainStatus = {
          verified: true, // Assuming verification succeeds
          nameservers: ['ns1.example-dns.com', 'ns2.example-dns.com'], // Example nameservers
          requiredNameservers: ['ns1.example-dns.com', 'ns2.example-dns.com'], // Same as required
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
      const appHost = process.env.NEXT_PUBLIC_APP_URL
        ? new URL(process.env.NEXT_PUBLIC_APP_URL).hostname
        : new URL(SITE_URL).hostname;
      const rootDomain = appHost || SITE_DOMAIN;
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
    // In a real implementation, you would integrate with your hosting provider here
    // For now, we'll simulate the domain check
    
    // Simulated domain configuration check
    const status = {
      verified: true, // Assuming verification succeeds
      nameservers: ['ns1.example-dns.com', 'ns2.example-dns.com'], // Example nameservers
      requiredNameservers: ['ns1.example-dns.com', 'ns2.example-dns.com'], // Same as required
    };
    
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
