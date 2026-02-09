'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function getRegisteredDomainsAction() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: 'User not authenticated.' };
  }

  try {
    const domains = await prisma.order.findMany({
      where: {
        userId: session.user.id,
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