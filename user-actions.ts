'use server';

import { verifySession } from '@/lib/verify-session';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function getRegisteredDomainsAction() {
  const session = await verifySession();
  if (!session?.sub) {
    return { error: 'User not authenticated.' };
  }

  try {
    const domains = await prisma.order.findMany({
      where: {
        userId: session.sub,
        productType: 'DOMAIN_REGISTRATION',
        status: 'COMPLETED',
      },
      select: {
        productId: true, // This is the domain name
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return { domains };
  } catch (error) {
    const err = error as Error;
    logger.error(`getRegisteredDomainsAction Error: ${err.message}`);
    return { error: 'Failed to fetch registered domains.' };
  }
}