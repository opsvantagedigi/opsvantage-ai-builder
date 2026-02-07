'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { openProvider } from '@/lib/openprovider/client';
import { prisma } from '@/lib/prisma';

export type CustomerData = {
  email: string;
  name: { firstName: string; lastName: string };
  address: { street: string; number: string; zipcode: string; city: string; country: string };
  phone: { countryCode: string; areaCode: string; subscriberNumber: string };
};

export async function createCustomerHandleAction(data: CustomerData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: 'User not authenticated.' };
  }

  try {
    const res = await openProvider.createCustomer(data);
    if (res.code !== 0 || !res.data?.handle) {
      throw new Error(res.desc || 'Failed to create customer handle.');
    }

    const handle = res.data.handle;

    // Save the handle to the user's profile
    await prisma.user.update({
      where: { id: session.user.id },
      data: { openProviderHandle: handle },
    });

    return { success: true, handle };
  } catch (error) {
    const err = error as Error;
    console.error('createCustomerHandleAction Error:', err);
    return { error: err.message || 'An unexpected error occurred.' };
  }
}