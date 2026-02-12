/**
 * Sustainable Pricing Engine (Zenith Price Oracle)
 *
 * ZenithPrice = (OpenProviderCost + MaintenanceReserve) + SustainabilityPremium
 *
 * Implemented margins (per spec):
 * - Domains: cost + $5.50
 * - SSL: cost + 150% (i.e. cost * 2.5)
 * - Licenses/Security: cost + $10.00 flat monthly fee
 */

type PricingCategory = "domains" | "ssl" | "licenses" | "security" | "domain" | "license";

// Competitor benchmark table (GoDaddy averages) used for savings badges.
const COMPETITOR_AVERAGE = {
  domains: {
    com: 21.99,
    default: 21.99,
  },
  ssl: {
    dv: 99.99,
    default: 99.99,
  },
  licenses: {
    defaultMonthly: 29.99,
  },
  security: {
    defaultMonthly: 15.0,
  },
} as const;

const SUSTAINABLE_MARGINS = {
  domains: 5.5,
  sslMultiplier: 2.5,
  licensesMonthly: 10.0,
  securityMonthly: 10.0,
} as const;

function normalizeCategory(category: PricingCategory): "domains" | "ssl" | "licenses" | "security" {
  if (category === "domain") return "domains";
  if (category === "license") return "licenses";
  return category;
}

/**
 * Calculate Zenith price based on OpenProvider cost and disruptor margins
 */
export const calculateZenithPrice = (category: PricingCategory, openProviderCost: number): number => {
  const normalized = normalizeCategory(category);

  switch (normalized) {
    case "domains":
      return openProviderCost + SUSTAINABLE_MARGINS.domains;
    case "ssl":
      return openProviderCost * SUSTAINABLE_MARGINS.sslMultiplier;
    case "licenses":
      return openProviderCost + SUSTAINABLE_MARGINS.licensesMonthly;
    case "security":
      return openProviderCost + SUSTAINABLE_MARGINS.securityMonthly;
  }
};

/**
 * Calculate savings percentage compared to industry average
 */
export const calculateSavingsPercentage = (
  zenithPrice: number,
  domainExtension?: string,
  sslType?: string,
  licenseType?: string,
  category?: PricingCategory
): number => {
  const normalized = category ? normalizeCategory(category) : undefined;

  let competitor = 0;
  if (normalized === "domains") {
    const ext = (domainExtension ?? "").toLowerCase();
    competitor = (COMPETITOR_AVERAGE.domains as any)[ext] ?? COMPETITOR_AVERAGE.domains.default;
  } else if (normalized === "ssl") {
    const ssl = (sslType ?? "").toLowerCase();
    competitor = (COMPETITOR_AVERAGE.ssl as any)[ssl] ?? COMPETITOR_AVERAGE.ssl.default;
  } else if (normalized === "licenses") {
    competitor = COMPETITOR_AVERAGE.licenses.defaultMonthly;
  } else if (normalized === "security") {
    competitor = COMPETITOR_AVERAGE.security.defaultMonthly;
  } else if (domainExtension) {
    competitor = (COMPETITOR_AVERAGE.domains as any)[domainExtension.toLowerCase()] ?? COMPETITOR_AVERAGE.domains.default;
  } else if (sslType) {
    competitor = (COMPETITOR_AVERAGE.ssl as any)[sslType.toLowerCase()] ?? COMPETITOR_AVERAGE.ssl.default;
  } else if (licenseType) {
    competitor = COMPETITOR_AVERAGE.licenses.defaultMonthly;
  }

  if (competitor <= 0) return 0;
  const pct = Math.round(((competitor - zenithPrice) / competitor) * 100);
  return Math.max(0, pct);
};

/**
 * Get savings badge text
 */
export const getSavingsBadge = (zenithPrice: number, domainExtension?: string, sslType?: string, licenseType?: string): string | null => {
  const savingsPercent = calculateSavingsPercentage(zenithPrice, domainExtension, sslType, licenseType);
  
  if (savingsPercent > 0) {
    return `You saved ${savingsPercent}%`;
  }
  
  return null;
};

/**
 * Format price for display
 */
export const formatPrice = (price: number): string => {
  return `$${price.toFixed(2)}`;
};

/**
 * Get formatted price with savings badge
 */
export const getFormattedPriceWithSavings = (
  category: PricingCategory,
  openProviderCost: number, 
  domainExtension?: string, 
  sslType?: string, 
  licenseType?: string
): { price: string; savingsBadge: string | null; rawPrice: number } => {
  const zenithPrice = calculateZenithPrice(category, openProviderCost);
  const formattedPrice = formatPrice(zenithPrice);
  const savingsPercent = calculateSavingsPercentage(zenithPrice, domainExtension, sslType, licenseType, category);
  const savingsBadge = savingsPercent > 0 ? `You saved ${savingsPercent}%` : null;
  
  return {
    price: formattedPrice,
    savingsBadge,
    rawPrice: zenithPrice
  };
};

/**
 * Special launch offers for the Founders 25
 */
export const getFoundersOffers = () => {
  return {
    estateLock: {
      name: "The Estate Lock",
      description: "Register a .com domain for just $0.88",
      originalPrice: COMPETITOR_AVERAGE.domains.com,
      offerPrice: 0.88,
      savings: Math.round(((COMPETITOR_AVERAGE.domains.com - 0.88) / COMPETITOR_AVERAGE.domains.com) * 100),
      available: true // Assuming first 25 signups
    },
    evEscalation: {
      name: "The EV Escalation",
      description: "Secure a Premium EV SSL for the price of a Standard DV SSL",
      originalPrice: 299.0,
      offerPrice: COMPETITOR_AVERAGE.ssl.dv,
      savings: Math.round(((299.0 - COMPETITOR_AVERAGE.ssl.dv) / 299.0) * 100),
      savingsAmount: 299.0 - COMPETITOR_AVERAGE.ssl.dv,
      available: true // Available for launch
    },
    architectsLifeline: {
      name: "Architect's Lifeline",
      description: "Free Plesk Web Admin Edition and SpamExpert for the first 12 months",
      originalPrice: COMPETITOR_AVERAGE.licenses.defaultMonthly * 12,
      offerPrice: 0,
      duration: "12 months",
      available: true // Available for launch
    }
  };
};

export default {
  calculateZenithPrice,
  calculateSavingsPercentage,
  getSavingsBadge,
  formatPrice,
  getFormattedPriceWithSavings,
  getFoundersOffers
};