'use server';

import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { openProvider } from '@/lib/openprovider/client';
import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';
import { verifySession } from '@/lib/verify-session';

// Schema for the customer data required by OpenProvider, based on ICANN rules.
const customerDataSchema = z.object({
  companyName: z.string().optional(),
  name: z.object({
    firstName: z.string().min(1, "First name is required."),
    lastName: z.string().min(1, "Last name is required."),
  }),
  address: z.object({
    street: z.string().min(1, "Street is required."),
    number: z.string().min(1, "Street number is required."),
    zipcode: z.string().min(1, "Zip code is required."),
    city: z.string().min(1, "City is required."),
    country: z.string().length(2, "Country must be a 2-letter code."),
  }),
  phone: z.object({
    countryCode: z.string().min(1, "Country code is required."),
    areaCode: z.string().min(1, "Area code is required."),
    subscriberNumber: z.string().min(1, "Phone number is required."),
  }),
  email: z.string().email("A valid email is required."),
});

export type CustomerData = z.infer<typeof customerDataSchema>;

/**
 * Checks for an existing OpenProvider handle for the current user.
 * If a handle exists, it's returned.
 * If not, it creates a new customer handle with OpenProvider and saves it.
 */
export async function getOrCreateCustomerHandleAction(customerData: CustomerData) {
  // Verify session using the standardized method
  const session = await verifySession();
  if (!session) {
    return { error: 'User not authenticated: No session found.' };
  }

  const userId = session.sub;
  if (!userId) {
    return { error: 'User not authenticated: No user ID in session.' };
  }

  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
    select: { openProviderHandle: true },
  });

  if (!user) {
    return { error: 'User not found.' };
  }

  // If user already has a handle, return it immediately.
  if (user.openProviderHandle) {
    return { handle: user.openProviderHandle };
  }

  // Validate the provided data before sending to OpenProvider
  const validation = customerDataSchema.safeParse(customerData);
  if (!validation.success) {
    return { error: 'Invalid customer data.', details: validation.error.flatten() };
  }

  try {
    // Create the customer handle via OpenProvider API
    const response = await openProvider.createCustomer(validation.data);
    if (!response.data?.handle) {
      throw new Error(response.desc || 'Failed to create customer handle in OpenProvider.');
    }
    const newHandle = response.data.handle;

    // Save the new handle to our database for future use
    await prisma.user.update({ where: { id: userId }, data: { openProviderHandle: newHandle } });

    return { handle: newHandle };
  } catch (error: any) {
    console.error("Customer Handle Creation Error:", error);
    return { error: error.message || "An unexpected error occurred." };
  }
}