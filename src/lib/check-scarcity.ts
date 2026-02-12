import { prisma } from '@/lib/db';

/**
 * Checks the scarcity of available slots for the "Founders 25" offering
 * @returns boolean indicating if slots are still available
 */
export async function checkScarcity(): Promise<boolean> {
  try {
    // Count the number of claimed "Founders 25" slots
    const claimedCount = await prisma.foundersClaim.count({
      where: {
        offerId: 'FOUNDERS_25', // Assuming this is the offer ID for the Founders 25 program
      },
    });

    // The total available slots is 25
    const totalAvailableSlots = 25;
    const slotsRemaining = totalAvailableSlots - claimedCount;

    // Return true if there are still slots available
    return slotsRemaining > 0;
  } catch (error) {
    console.error('Error checking scarcity:', error);
    // In case of error, assume no slots are available to be safe
    return false;
  }
}

/**
 * Gets the current count of claimed slots
 * @returns number of claimed slots
 */
export async function getClaimedCount(): Promise<number> {
  try {
    const claimedCount = await prisma.foundersClaim.count({
      where: {
        offerId: 'FOUNDERS_25',
      },
    });

    return claimedCount;
  } catch (error) {
    console.error('Error getting claimed count:', error);
    return 0;
  }
}

/**
 * Gets the number of remaining slots
 * @returns number of remaining slots
 */
export async function getRemainingSlots(): Promise<number> {
  try {
    const claimedCount = await getClaimedCount();
    const totalAvailableSlots = 25;
    return Math.max(0, totalAvailableSlots - claimedCount);
  } catch (error) {
    console.error('Error getting remaining slots:', error);
    return 0;
  }
}