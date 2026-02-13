'use server'

import { openProvider } from '../../lib/openprovider/client';

/**
 * 💰 WHITELABEL PROFIT ENGINE
 * Default Markup: 1.5x (50% Profit Margin)
 */
const MARKUP = parseFloat(process.env.NEXT_PUBLIC_PRICING_MARKUP || "1.5");

export async function checkDomainAvailabilityAction(fullDomain: string) {
    // Validate domain format
    const parts = fullDomain.trim().split('.');
    if (parts.length < 2) {
        return { error: "Invalid domain format. Use format: name.com" };
    }

    const extension = parts.pop()!;
    const name = parts.join('.');

    try {
        const response = await openProvider.checkDomain(name, extension);

        if (!response.data || !response.data.results || response.data.results.length === 0) {
            return { error: "Intelligence update failed. MARZ is investigating the connection." };
        }

        const result = response.data.results[0];

        // Whitelabel Pricing Logic
        if (result.price?.reseller) {
            const costPrice = result.price.reseller.price!;
            const currency = result.price.reseller.currency;

            // Check if costPrice is defined before using it
            if (costPrice === undefined || costPrice === null || typeof costPrice !== 'number') {
                return {
                    status: result.status,
                    domain: result.domain,
                    price: {
                        currency: currency || 'USD',
                        amount: '0.00',
                    },
                    isPremium: result.is_premium
                };
            }

            // Check if costPrice is defined before using it
            if (costPrice === undefined || costPrice === null || typeof costPrice !== 'number') {
                return {
                    status: result.status,
                    domain: result.domain,
                    price: {
                        currency: currency || 'USD',
                        amount: '0.00',
                    },
                    isPremium: result.is_premium
                };
            }

            // Calculate Retail Price with Markup
            if (typeof costPrice !== 'number') {
                return {
                    status: result.status,
                    domain: result.domain,
                    price: {
                        currency: currency || 'USD',
                        amount: '0.00',
                    },
                    isPremium: result.is_premium
                };
            }
            
            const retailAmount = (costPrice * MARKUP).toFixed(2);

            return {
                status: result.status,
                domain: result.domain,
                price: {
                    currency: currency || 'USD',
                    amount: retailAmount,
                },
                isPremium: result.is_premium
            };
        }

        // Return status without price if reseller price isn't exposed or domain is taken
        return {
            status: result.status,
            domain: result.domain,
            isPremium: result.is_premium
        };

    } catch {
        return { error: "Neural link timeout. Repurposing bandwidth..." };
    }
}
