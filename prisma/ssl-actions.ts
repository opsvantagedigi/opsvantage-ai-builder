'use server';

import { openProvider } from '@/lib/openprovider/client';

const MARKUP = parseFloat(process.env.NEXT_PUBLIC_PRICING_MARKUP || "1.2");

export async function getSSLProductsAction() {
  try {
    const response = await openProvider.getSSLProducts();

    if (!response.data || !response.data.results) {
      throw new Error('Could not retrieve SSL products.');
    }

    // Apply white-label markup to each product price
    const productsWithMarkup = response.data.results.map((product: {
      prices?: { price?: { reseller?: { price: number; currency: string } } }[]
    }) => {
      if (product.prices?.[0]?.price?.reseller) {
        const cost = product.prices[0].price.reseller.price;
        product.prices[0].price.reseller.price = Number((cost * MARKUP).toFixed(2));
      }
      return product;
    });

    return { products: productsWithMarkup };

  } catch (error) {
    console.error("SSL Product Fetch Error:", error);
    return { error: "Failed to fetch SSL products." };
  }
}