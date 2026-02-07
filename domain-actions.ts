'use server'

import { openProvider } from '@/lib/openprovider/client';

const MARKUP = parseFloat(process.env.NEXT_PUBLIC_PRICING_MARKUP || "1.2");

export async function checkDomainAvailabilityAction(fullDomain: string) {
  const parts = fullDomain.split('.');
  if (parts.length < 2) return { error: "Invalid domain format. Please include the extension (e.g., .com)." };
  
  const ext = parts.pop() as string;
  const name = parts.join('.');

  if (!name || !ext) return { error: "Invalid domain format" };

  try {
    const response = await openProvider.checkDomain(name, ext);
    const result = response.data.results[0];

    // WHITE-LABELING LOGIC
    // We hide the 'reseller' price (our cost) and only show the markup price
    if (result.price && result.price.reseller) {
      const cost = result.price.reseller.price;
      const currency = result.price.reseller.currency;
      
      // Calculate Retail Price
      const retailPrice = (cost * MARKUP).toFixed(2);

      return {
        status: result.status, // "free", "active", "quarantine"
        domain: result.domain,
        price: {
          currency: currency,
          amount: retailPrice, // Sent to frontend
        },
        isPremium: result.is_premium
      };
    }

    return { status: result.status, domain: result.domain };

  } catch (error) {
    console.error("Domain Check Error:", error);
    return { error: "Failed to check availability. Please try again." };
  }
}