'use server';

import { openProvider } from '../../src/lib/openprovider/client';

const MARKUP = parseFloat(process.env.NEXT_PUBLIC_PRICING_MARKUP || "1.2");

export async function getSSLProductsAction() {
  try {
    const res = await openProvider.getSSLProducts();
    if (res.code !== 0) {
      throw new Error(res.desc || 'Failed to fetch SSL products.');
    }

    // Apply markup to prices
    const productsWithMarkup = res.data.results.map((product: Record<string, unknown>) => {
      if (product.prices && Array.isArray(product.prices) && (product.prices[0] as { price?: { reseller?: { price?: string; currency?: string } } })?.price?.reseller?.price) {
        const reseller = (product.prices[0] as { price: { reseller: { price: string; currency: string } } }).price.reseller;
        const retailPrice = (parseFloat(reseller.price) * MARKUP).toFixed(2);
        reseller.price = retailPrice;
      }
      return product;
    });

    return { products: productsWithMarkup };
  } catch (error) {
    const err = error as Error;
    console.error('getSSLProductsAction Error:', err);
    return { error: err.message || 'An unexpected error occurred.' };
  }
}